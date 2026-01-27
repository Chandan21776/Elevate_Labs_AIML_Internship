"""
Data Cleaning & Missing Value Handling Script
----------------------------------------------
Complete implementation of the 7-step data cleaning workflow.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# Set display options
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)

def print_section(title):
    """Print formatted section header"""
    print("\n" + "=" * 70)
    print(title.center(70))
    print("=" * 70)

def load_and_explore(filepath):
    """Step 1: Load dataset and perform initial exploration"""
    print_section("STEP 1: LOADING AND EXPLORING DATASET")
    
    df = pd.read_csv(filepath)
    
    print(f"\n✓ Dataset loaded successfully from: {filepath}")
    print(f"✓ Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    
    print("\n📊 First 5 rows:")
    print(df.head())
    
    print("\n📊 Data types:")
    print(df.dtypes)
    
    print("\n📊 Basic statistics:")
    print(df.describe())
    
    return df

def identify_missing_values(df):
    """Step 2: Identify and analyze missing values"""
    print_section("STEP 2: IDENTIFYING MISSING VALUES")
    
    missing_values = df.isnull().sum()
    missing_percentage = (df.isnull().sum() / len(df)) * 100
    
    missing_df = pd.DataFrame({
        'Column': missing_values.index,
        'Missing_Count': missing_values.values,
        'Missing_Percentage': missing_percentage.values
    })
    
    missing_df = missing_df[missing_df['Missing_Count'] > 0].sort_values(
        'Missing_Count', ascending=False
    )
    
    if len(missing_df) > 0:
        print("\n📋 Missing Values Summary:")
        print(missing_df.to_string(index=False))
        
        total_missing = missing_values.sum()
        total_cells = df.size
        overall_completeness = (1 - total_missing / total_cells) * 100
        
        print(f"\n📊 Overall Statistics:")
        print(f"   Total missing values: {total_missing}")
        print(f"   Total cells: {total_cells}")
        print(f"   Data completeness: {overall_completeness:.2f}%")
    else:
        print("\n✓ No missing values found!")
    
    return missing_df

def visualize_missing_data(df, missing_df):
    """Step 3: Visualize missing data patterns"""
    print_section("STEP 3: VISUALIZING MISSING DATA")
    
    if len(missing_df) == 0:
        print("\n✓ No missing data to visualize")
        return
    
    # Create visualization
    plt.figure(figsize=(12, 6))
    
    # Bar chart
    plt.subplot(1, 2, 1)
    colors = ['red' if x > 50 else 'orange' if x > 20 else 'green' 
              for x in missing_df['Missing_Percentage']]
    plt.bar(missing_df['Column'], missing_df['Missing_Percentage'], color=colors, alpha=0.7)
    plt.xlabel('Columns', fontsize=12)
    plt.ylabel('Missing Percentage (%)', fontsize=12)
    plt.title('Missing Data by Column', fontsize=14, fontweight='bold')
    plt.xticks(rotation=45, ha='right')
    plt.axhline(y=50, color='red', linestyle='--', label='50% threshold')
    plt.legend()
    plt.grid(axis='y', alpha=0.3)
    
    # Heatmap
    plt.subplot(1, 2, 2)
    sns.heatmap(df.isnull(), cbar=False, yticklabels=False, cmap='RdYlGn_r')
    plt.title('Missing Data Heatmap', fontsize=14, fontweight='bold')
    plt.xlabel('Columns', fontsize=12)
    plt.ylabel('Rows', fontsize=12)
    
    plt.tight_layout()
    plt.savefig('missing_data_visualization.png', dpi=300, bbox_inches='tight')
    print("\n✓ Visualization saved as 'missing_data_visualization.png'")
    plt.close()

def remove_high_missing_columns(df, threshold=0.5):
    """Step 4: Remove columns with high missing percentages"""
    print_section(f"STEP 4: REMOVING COLUMNS WITH >{threshold*100}% MISSING")
    
    missing_percentage = df.isnull().sum() / len(df)
    cols_to_drop = missing_percentage[missing_percentage > threshold].index.tolist()
    
    if cols_to_drop:
        print(f"\n🗑️  Dropping {len(cols_to_drop)} column(s):")
        for col in cols_to_drop:
            pct = missing_percentage[col] * 100
            print(f"   - {col}: {pct:.1f}% missing")
        
        df_cleaned = df.drop(columns=cols_to_drop)
        print(f"\n✓ New shape: {df_cleaned.shape}")
        return df_cleaned, cols_to_drop
    else:
        print("\n✓ No columns to drop (all below threshold)")
        return df, []

def impute_numerical_columns(df):
    """Step 5: Impute numerical columns with mean or median"""
    print_section("STEP 5: IMPUTING NUMERICAL COLUMNS")
    
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if not numerical_cols:
        print("\n✓ No numerical columns to impute")
        return df
    
    print(f"\n🔢 Found {len(numerical_cols)} numerical column(s):")
    
    for col in numerical_cols:
        if df[col].isnull().sum() > 0:
            # Calculate skewness to decide mean vs median
            skewness = df[col].skew()
            
            if abs(skewness) < 1:  # Roughly normal distribution
                impute_value = df[col].mean()
                method = "mean"
            else:  # Skewed distribution
                impute_value = df[col].median()
                method = "median"
            
            missing_count = df[col].isnull().sum()
            df[col].fillna(impute_value, inplace=True)
            
            print(f"   ✓ {col:20s}: Imputed {missing_count:4d} values with {method:6s} = {impute_value:10.2f} (skewness={skewness:.2f})")
        else:
            print(f"   - {col:20s}: No missing values")
    
    return df

def impute_categorical_columns(df):
    """Step 6: Impute categorical columns with mode"""
    print_section("STEP 6: IMPUTING CATEGORICAL COLUMNS")
    
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    if not categorical_cols:
        print("\n✓ No categorical columns to impute")
        return df
    
    print(f"\n📝 Found {len(categorical_cols)} categorical column(s):")
    
    for col in categorical_cols:
        if df[col].isnull().sum() > 0:
            mode_value = df[col].mode()[0]
            missing_count = df[col].isnull().sum()
            df[col].fillna(mode_value, inplace=True)
            
            print(f"   ✓ {col:20s}: Imputed {missing_count:4d} values with mode = '{mode_value}'")
        else:
            print(f"   - {col:20s}: No missing values")
    
    return df

def remove_duplicates(df):
    """Step 7: Remove duplicate rows"""
    print_section("STEP 7: REMOVING DUPLICATES")
    
    duplicates = df.duplicated().sum()
    
    if duplicates > 0:
        print(f"\n🔍 Found {duplicates} duplicate row(s)")
        df_cleaned = df.drop_duplicates()
        print(f"✓ Removed {duplicates} duplicate(s)")
        print(f"✓ New shape: {df_cleaned.shape}")
        return df_cleaned
    else:
        print("\n✓ No duplicates found")
        return df

def validate_dataset(df):
    """Step 8: Validate cleaned dataset"""
    print_section("STEP 8: VALIDATING CLEANED DATASET")
    
    remaining_missing = df.isnull().sum().sum()
    
    print(f"\n📊 Validation Results:")
    print(f"   Remaining missing values: {remaining_missing}")
    
    if remaining_missing > 0:
        print(f"\n⚠️  Warning: Still have missing values:")
        print(df.isnull().sum()[df.isnull().sum() > 0])
    else:
        print("   ✓ No missing values!")
    
    print(f"\n📊 Data Types:")
    print(df.dtypes)
    
    print(f"\n📊 Summary Statistics:")
    print(df.describe())
    
    return remaining_missing == 0

def compare_before_after(original_shape, cleaned_shape, dropped_cols, 
                        original_missing, cleaned_missing):
    """Step 9: Compare before and after cleaning"""
    print_section("STEP 9: BEFORE VS AFTER COMPARISON")
    
    rows_removed = original_shape[0] - cleaned_shape[0]
    cols_removed = original_shape[1] - cleaned_shape[1]
    
    original_cells = original_shape[0] * original_shape[1]
    cleaned_cells = cleaned_shape[0] * cleaned_shape[1]
    
    original_completeness = (1 - original_missing / original_cells) * 100
    cleaned_completeness = (1 - cleaned_missing / cleaned_cells) * 100
    
    print(f"\n📊 Shape Comparison:")
    print(f"   Original: {original_shape[0]:,} rows × {original_shape[1]} columns")
    print(f"   Cleaned:  {cleaned_shape[0]:,} rows × {cleaned_shape[1]} columns")
    print(f"   Removed:  {rows_removed:,} rows, {cols_removed} columns")
    
    if dropped_cols:
        print(f"\n🗑️  Dropped Columns: {', '.join(dropped_cols)}")
    
    print(f"\n📊 Missing Values:")
    print(f"   Original: {original_missing:,} missing values ({100-original_completeness:.2f}%)")
    print(f"   Cleaned:  {cleaned_missing:,} missing values ({100-cleaned_completeness:.2f}%)")
    print(f"   Improvement: {original_missing - cleaned_missing:,} values filled")
    
    print(f"\n📊 Data Quality:")
    print(f"   Original completeness: {original_completeness:.2f}%")
    print(f"   Cleaned completeness:  {cleaned_completeness:.2f}%")
    print(f"   Improvement: {cleaned_completeness - original_completeness:.2f}%")

def save_cleaned_dataset(df, output_path='cleaned_dataset.csv'):
    """Step 10: Save cleaned dataset"""
    print_section("STEP 10: SAVING CLEANED DATASET")
    
    df.to_csv(output_path, index=False)
    print(f"\n✓ Cleaned dataset saved to: {output_path}")
    print(f"✓ Final shape: {df.shape}")
    
    # Create a cleaning report
    report_path = 'cleaning_report.txt'
    with open(report_path, 'w') as f:
        f.write("DATA CLEANING REPORT\n")
        f.write("=" * 70 + "\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Input file: dataset.csv\n")
        f.write(f"Output file: {output_path}\n")
        f.write(f"Final shape: {df.shape}\n")
        f.write(f"\nColumns:\n")
        for col in df.columns:
            f.write(f"  - {col} ({df[col].dtype})\n")
    
    print(f"✓ Cleaning report saved to: {report_path}")

def main():
    """Main execution function"""
    print("\n" + "=" * 70)
    print("DATA CLEANING & MISSING VALUE HANDLING".center(70))
    print("Complete 10-Step Workflow".center(70))
    print("=" * 70)
    
    # Load dataset
    df_original = load_and_explore('dataset.csv')
    original_shape = df_original.shape
    original_missing = df_original.isnull().sum().sum()
    
    # Make a copy for cleaning
    df = df_original.copy()
    
    # Identify missing values
    missing_df = identify_missing_values(df)
    
    # Visualize missing data
    visualize_missing_data(df, missing_df)
    
    # Remove high missing columns
    df, dropped_cols = remove_high_missing_columns(df, threshold=0.5)
    
    # Impute numerical columns
    df = impute_numerical_columns(df)
    
    # Impute categorical columns
    df = impute_categorical_columns(df)
    
    # Remove duplicates
    df = remove_duplicates(df)
    
    # Validate
    is_valid = validate_dataset(df)
    
    # Compare
    cleaned_shape = df.shape
    cleaned_missing = df.isnull().sum().sum()
    compare_before_after(original_shape, cleaned_shape, dropped_cols,
                        original_missing, cleaned_missing)
    
    # Save
    save_cleaned_dataset(df)
    
    # Final message
    print_section("✅ DATA CLEANING COMPLETE!")
    print("\nDeliverables:")
    print("  ✓ cleaned_dataset.csv - Cleaned dataset")
    print("  ✓ missing_data_visualization.png - Missing data visualization")
    print("  ✓ cleaning_report.txt - Detailed cleaning report")
    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
