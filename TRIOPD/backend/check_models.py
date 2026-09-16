import os
import joblib

# Define the path to your models folder
MODELS_DIR = os.path.join('ml', 'models')

# List of models to check
models_to_check = {
    "Handwriting": "handwriting_model.pkl",
    "Voice": "voice_model.pkl",
    "Gait": "gait_model.pkl"
}

print("="*60)
print("TRIOPD MODEL ACCURACY & ALGORITHM CHECKER")
print("="*60)

for name, filename in models_to_check.items():
    model_path = os.path.join(MODELS_DIR, filename)
    info_path = os.path.join(MODELS_DIR, filename.replace('.pkl', '_info.pkl'))
    
    print(f"\n--- {name} Model ---")
    
    # 1. Check if model exists and get Algorithm
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        
        # Get the exact ML Algorithm name
        algo_name = type(model).__name__
        print(f"✅ ML Algorithm Used: {algo_name}")
        
        # Optional: Show key parameters of the algorithm
        if hasattr(model, 'get_params'):
            params = model.get_params()
            print(f"   ↳ Estimators (Trees): {params.get('n_estimators', 'N/A')}")
            print(f"   ↳ Max Depth: {params.get('max_depth', 'N/A')}")
            
    else:
        print(f"❌ Model file '{filename}' not found!")
        continue
        
    # 2. Check Saved Accuracy
    if os.path.exists(info_path):
        info = joblib.load(info_path)
        test_acc = info.get('test_accuracy', info.get('accuracy', 0))
        train_acc = info.get('train_accuracy', 0)
        
        print(f"📊 Saved Test Accuracy:  {test_acc * 100:.2f}%")
        print(f"📊 Saved Train Accuracy: {train_acc * 100:.2f}%")
    else:
        print("⚠️ Accuracy info file not found. (Need original test data to recalculate).")

print("\n" + "="*60)
print("Check complete!")
print("="*60)