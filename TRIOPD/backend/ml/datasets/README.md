# Dataset Placement Instructions
Do not commit raw datasets to version control. Place the following datasets in their respective folders:

1. GAIT: PhysioNet Parkinson's Gait Dataset
   - Folder: `ml/datasets/gait/`
   - Expected files: `gait_pd.csv`, `gait_control.csv` (or similar structured format with subject IDs and sensor data).

2. VOICE: UCI Parkinson's Speech Dataset
   - Folder: `ml/datasets/voice/`
   - Expected files: `audio/` folder with `.wav` files and a `metadata.csv` mapping filename to diagnosis.

3. HANDWRITING: NewHandPD Dataset
   - Folder: `ml/datasets/handwriting/`
   - Expected files: `.csv` or `.json` files containing time-series trajectory data (x, y, timestamp, pressure).

4. SEVERITY: PPMI Dataset
   - Folder: `ml/datasets/ppmi/`
   - Expected files: `clinical.csv` containing MDS-UPDRS scores or similar severity metrics mapped to subject IDs.

If datasets are missing, training scripts will raise a clear `FileNotFoundError` with instructions.