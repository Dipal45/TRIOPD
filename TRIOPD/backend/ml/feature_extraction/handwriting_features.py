import numpy as np
import pandas as pd

def extract_handwriting_features(trajectory_data: list) -> dict:
    """
    Extracts movement features from handwriting tracing trajectory.
    trajectory_data: list of dicts with keys: x, y, timestamp, pressure
    """
    if not trajectory_data or len(trajectory_data) < 5:
        raise ValueError("Insufficient trajectory data.")

    df = pd.DataFrame(trajectory_data)
    df['timestamp'] = pd.to_numeric(df['timestamp'])
    
    # Calculate time differences and distances
    df['dt'] = df['timestamp'].diff().fillna(1)
    df['dx'] = df['x'].diff().fillna(0)
    df['dy'] = df['y'].diff().fillna(0)
    df['distance'] = np.sqrt(df['dx']**2 + df['dy']**2)
    
    # Velocity and Acceleration
    df['velocity'] = df['distance'] / (df['dt'] + 1e-6)
    df['acceleration'] = df['velocity'].diff().fillna(0) / (df['dt'] + 1e-6)
    df['jerk'] = df['acceleration'].diff().fillna(0) / (df['dt'] + 1e-6)
    
    # Pauses (velocity < threshold)
    pause_threshold = 0.5
    df['is_pause'] = (df['velocity'] < pause_threshold).astype(int)
    
    features = {
        'total_path_length': float(df['distance'].sum()),
        'completion_time_ms': float(df['timestamp'].max() - df['timestamp'].min()),
        'mean_velocity': float(df['velocity'].mean()),
        'velocity_var': float(df['velocity'].var()),
        'mean_jerk': float(np.abs(df['jerk']).mean()),
        'pause_count': int(df['is_pause'].sum()),
        'mean_pressure': float(df['pressure'].mean()) if 'pressure' in df.columns else 0.5
    }
    return features