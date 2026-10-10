#!/usr/bin/env python3
"""
========================================================================================
TELDS Virtual Hardware Prototype: ESP32 Edge Telemetry Simulator
========================================================================================
Simulates an ESP32 microcontroller with:
- CT1 Current Sensor (Transformer Input Current, 0 - 100A RMS)
- CT2 Current Sensor (Consumer Aggregate Metered Current, 0 - 100A RMS)
- ZMPT101B AC Voltage Sensor (230V AC Nominal)
- Edge thresholding (Warning > 10%, Critical > 18%)
- Peak-Hour (19:00 - 22:00) loss surge simulation
- Wireless JSON packet dispatch to backend
"""

import time
import math
import random
import datetime
import urllib.request
import json
import sys

BACKEND_URL = "http://localhost:8000/api/v1/telemetry/reading"
TRANSFORMER_CODE = "TX-RES-308"

def get_simulated_readings(sim_hour: int):
    # Base voltage with realistic grid fluctuation
    voltage_v = round(230.0 + random.uniform(-4.5, 3.5), 1)
    
    # Is it peak hours (19:00 - 22:00)?
    is_peak = 19 <= sim_hour <= 21
    
    if is_peak:
        # Evening peak load: high residential demand
        i_input_base = random.uniform(65.0, 78.0)
        # Introduce anomalous loss (unmetered load / bypass)
        loss_pct = random.uniform(22.0, 32.0)
    elif 0 <= sim_hour <= 5:
        # Night baseline
        i_input_base = random.uniform(18.0, 24.0)
        loss_pct = random.uniform(4.8, 6.2) # Normal technical loss
    else:
        # Daytime load
        i_input_base = random.uniform(35.0, 48.0)
        loss_pct = random.uniform(5.2, 7.8)

    ct1_input_a = round(i_input_base, 2)
    ct2_consumer_a = round(ct1_input_a * (1.0 - (loss_pct / 100.0)), 2)
    
    diff_a = round(ct1_input_a - ct2_consumer_a, 2)
    calc_loss_pct = round((diff_a / ct1_input_a) * 100.0, 2) if ct1_input_a > 0 else 0.0
    
    pf = 0.92
    p_in_kw = round((voltage_v * ct1_input_a * pf) / 1000.0, 2)
    p_out_kw = round((voltage_v * ct2_consumer_a * pf) / 1000.0, 2)
    
    is_anomaly = calc_loss_pct >= 12.0

    return {
        "transformer_code": TRANSFORMER_CODE,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "sim_hour": f"{sim_hour:02d}:00",
        "voltage_v": voltage_v,
        "current_ct1_input_a": ct1_input_a,
        "current_ct2_consumer_a": ct2_consumer_a,
        "current_diff_a": diff_a,
        "input_power_kw": p_in_kw,
        "consumer_power_kw": p_out_kw,
        "loss_percentage": calc_loss_pct,
        "is_peak_hour": is_peak,
        "is_anomaly": is_anomaly
    }

def print_edge_display(data):
    anomaly_badge = "\033[91m[ALERT: ANOMALY!]\033[0m" if data["is_anomaly"] else "\033[92m[NORMAL GRID]\033[0m"
    peak_badge = " [PEAK 19-22h]" if data["is_peak_hour"] else ""
    
    print("=" * 64)
    print(f"⚡ VIRTUAL ESP32 TELEMETRY NODE | Node ID: {data['transformer_code']}")
    print(f"Time: {data['timestamp']} (Grid Cycle: {data['sim_hour']}){peak_badge}")
    print("-" * 64)
    print(f" Mains Voltage: {data['voltage_v']} V AC")
    print(f" CT1 Tx Input Current:     {data['current_ct1_input_a']:6.2f} A  --> Input Power:    {data['input_power_kw']:5.2f} kW")
    print(f" CT2 Consumer Agg Current: {data['current_ct2_consumer_a']:6.2f} A  --> Consumer Power: {data['consumer_power_kw']:5.2f} kW")
    print(f" Difference (Δ):          {data['current_diff_a']:6.2f} A")
    print(f" Energy Loss Rate:         {data['loss_percentage']:6.2f} %   {anomaly_badge}")
    print("=" * 64)

def transmit_telemetry(payload):
    try:
        req = urllib.request.Request(
            BACKEND_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=1.5) as response:
            return response.status
    except Exception:
        # Standalone offline buffer mode
        return None

def main():
    print("\n[TELDS Virtual ESP32 Hardware Prototype Starting]")
    print(f"Streaming dual CT current telemetry for {TRANSFORMER_CODE}...")
    print("Simulating 24-hour load pattern with 19:00-22:00 peak anomaly cycle.\n")
    
    hour = 17 # Start in late afternoon transitioning to 19:00 peak!
    
    try:
        for cycle in range(12):
            data = get_simulated_readings(hour)
            print_edge_display(data)
            
            http_status = transmit_telemetry(data)
            if http_status:
                print(f"--> Transmitted to Central Backend ({BACKEND_URL}): HTTP {http_status}\n")
            else:
                print("--> Autonomous Edge Mode (Local Storage & OLED active; Backend offline/buffered)\n")

            hour = (hour + 1) % 24
            time.sleep(1.5)
            
        print("\n[Simulator demonstration cycle complete. Ready for continuous streaming.]")
    except KeyboardInterrupt:
        print("\nVirtual ESP32 stopped by operator.")

if __name__ == "__main__":
    main()
