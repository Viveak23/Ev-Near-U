import React, { useState, useEffect } from 'react';
import {
  Zap,
  Clock,
  BatteryCharging,
  Gauge,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause,
  StopCircle,
  Edit3,
  Sliders,
  DollarSign
} from 'lucide-react';

export const LiveTelemetryMeter = ({
  session,
  isHost = false,
  onStopSession,
  onUpdateManualReadings
}) => {
  if (!session) return null;

  // Running telemetry state
  const [elapsedSeconds, setElapsedSeconds] = useState(
    Math.max(0, Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000))
  );
  const [livePowerKW, setLivePowerKW] = useState(session.currentPowerKW || session.charger?.powerKW || 11);
  const [energyConsumedKWh, setEnergyConsumedKWh] = useState(session.energyConsumedKWh || 0);
  const [currentSOC, setCurrentSOC] = useState(session.currentSOC || 25);
  const [isPaused, setIsPaused] = useState(false);
  const [isManualMode, setIsManualMode] = useState(session.telemetrySource === 'Manual Meter Entry');

  // Manual entry fields
  const [manualKWh, setManualKWh] = useState(energyConsumedKWh);
  const [showManualInput, setShowManualInput] = useState(false);

  // Ticking stopwatch
  useEffect(() => {
    if (session.status !== 'In Progress' || isPaused) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      // In simulated mode, simulate slight power fluctuations and accumulate energy
      if (!isManualMode) {
        // Subtle power curve variation (+- 0.3 kW)
        const basePower = session.charger?.powerKW || 11;
        const jitter = (Math.random() - 0.5) * 0.4;
        const currentPower = Math.max(1, Number((basePower + jitter).toFixed(1)));
        setLivePowerKW(currentPower);

        // Energy increment = (kW * seconds) / 3600
        // E.g. 11kW for 1 second = 0.00305 kWh
        // We speed up simulation slightly (e.g. 10x real-time for live preview feeling)
        const deltaKWh = (currentPower * 10) / 3600;
        setEnergyConsumedKWh((prev) => {
          const nextVal = Number((prev + deltaKWh).toFixed(3));
          setManualKWh(nextVal);
          return nextVal;
        });

        // SOC progress
        setCurrentSOC((prev) => {
          if (prev >= (session.targetSOC || 95)) return prev;
          return Number((prev + 0.08).toFixed(1));
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session.status, isPaused, isManualMode, session.charger?.powerKW, session.targetSOC]);

  // Format stopwatch HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Live bill computation
  const priceKWh = session.pricingSnapshot?.pricePerKWh || session.charger?.pricing?.pricePerKWh || 15;
  const priceHour = session.pricingSnapshot?.pricePerHour || session.charger?.pricing?.pricePerHour || 0;
  const timeFeeEnabled = Boolean(session.pricingSnapshot?.timeFeeEnabled ?? session.charger?.pricing?.timeFeeEnabled);

  const energyCost = energyConsumedKWh * priceKWh;
  const hoursBillable = elapsedSeconds / 3600;
  const timeCost = timeFeeEnabled ? hoursBillable * priceHour : 0;
  const subtotal = energyCost + timeCost;
  const platformFee = subtotal * 0.05;
  const taxes = (subtotal + platformFee) * 0.18;
  const runningTotalCost = subtotal + platformFee + taxes;

  const handleApplyManual = () => {
    const val = parseFloat(manualKWh) || 0;
    setEnergyConsumedKWh(val);
    setShowManualInput(false);
    if (onUpdateManualReadings) {
      onUpdateManualReadings(val);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg">
      
      {/* Top Header: Session Badge & Telemetry Source Disclaimer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
              {session.sessionId}
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {session.status}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            {session.charger?.title || 'EV Charging Session'}
          </h2>
          <p className="text-xs text-slate-500">
            Host: <span className="font-semibold text-slate-700">{session.host?.name}</span> • Driver: <span className="font-semibold text-slate-700">{session.user?.name}</span>
          </p>
        </div>

        {/* Telemetry Source Tag with explicit transparency requirement */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-semibold text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {isManualMode ? 'Manual Meter Entry Mode' : 'Simulated Real-Time Telemetry'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isManualMode ? 'Readings entered directly by user/host' : 'Virtual testbench telemetry (IoT bridge ready)'}
          </p>
        </div>
      </div>

      {/* Main Real-Time Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
        
        {/* Metric 1: Battery SOC Progress */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Battery State of Charge</span>
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
              {currentSOC.toFixed(0)}%
              <span className="text-xs font-semibold text-slate-400">SOC</span>
            </div>
            {/* Battery bar */}
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mt-2 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, currentSOC)}%` }}
              ></div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            Target: {session.targetSOC || 90}% • Start: {session.initialSOC || 20}%
          </span>
        </div>

        {/* Metric 2: Live Charging Power (kW) */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Live Output Power</span>
            <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
              {livePowerKW}
              <span className="text-sm font-semibold text-slate-500">kW</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {session.charger?.chargingMethod} • {session.charger?.connectorType}
            </p>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Delivering active power
          </span>
        </div>

        {/* Metric 3: Energy Consumed (kWh) */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Energy Delivered</span>
            <Gauge className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
              {energyConsumedKWh.toFixed(2)}
              <span className="text-sm font-semibold text-slate-500">kWh</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              @ ₹{priceKWh} / kWh
            </p>
          </div>
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-left"
          >
            <Edit3 className="w-3 h-3" />
            <span>Override / Enter Meter</span>
          </button>
        </div>

        {/* Metric 4: Elapsed Time & Live Cost */}
        <div className="bg-emerald-950 text-white rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
            <span>Elapsed Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-emerald-400">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Running Bill:{' '}
              <span className="text-base font-extrabold text-white">
                ₹{runningTotalCost.toFixed(2)}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-300/80">
            Inclusive of taxes & platform fee
          </span>
        </div>
      </div>

      {/* Manual Input Dialog / Override Section */}
      {showManualInput && (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in">
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Edit3 className="w-4 h-4 text-emerald-600" />
            <span>Manual Meter Reading Override</span>
          </h4>
          <p className="text-xs text-slate-500 mb-3">
            If the charger has a physical sub-meter or display, enter the exact verified kWh reading below:
          </p>
          <div className="flex gap-2 max-w-sm">
            <input
              type="number"
              step="0.01"
              value={manualKWh}
              onChange={(e) => setManualKWh(e.target.value)}
              placeholder="e.g. 18.45"
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-bold flex-1"
            />
            <button
              onClick={handleApplyManual}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
            >
              Apply Reading
            </button>
          </div>
        </div>
      )}

      {/* Itemized Live Bill Breakdown */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-xs text-slate-600">
        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Real-Time Formula Billing Breakdown</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-slate-400">Energy Charge</p>
            <p className="font-bold text-slate-800">
              ₹{energyCost.toFixed(2)}{' '}
              <span className="text-[10px] text-slate-400 font-normal">({energyConsumedKWh.toFixed(2)} kWh)</span>
            </p>
          </div>
          <div>
            <p className="text-slate-400">Parking Time Fee</p>
            <p className="font-bold text-slate-800">
              {timeFeeEnabled ? `₹${timeCost.toFixed(2)}` : 'Not Applicable'}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Platform Fee (5%)</p>
            <p className="font-bold text-slate-800">₹{platformFee.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-slate-400">GST Tax (18%)</p>
            <p className="font-bold text-slate-800">₹{taxes.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
              isPaused
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'Resume Charging' : 'Pause Flow'}</span>
          </button>

          <button
            onClick={() => setIsManualMode(!isManualMode)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 flex items-center gap-2 transition"
          >
            <Sliders className="w-4 h-4" />
            <span>Switch to {isManualMode ? 'Simulated Telemetry' : 'Manual Entry'}</span>
          </button>
        </div>

        {/* STOP CHARGING BUTTON */}
        <button
          onClick={() => onStopSession && onStopSession(energyConsumedKWh)}
          className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-extrabold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2"
        >
          <StopCircle className="w-5 h-5" />
          <span>Stop Charging & Generate Final Bill</span>
        </button>
      </div>
    </div>
  );
};
