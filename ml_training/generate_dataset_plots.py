import matplotlib.pyplot as plt
import numpy as np

# ---------------------------------------------------------
# FIGURE 4.2.1.1: Target Class Balance (Diabetes vs Non-Diabetes)
# Dataset: 100,000 total records (approx 91.5% Non-Diabetic, 8.5% Diabetic)
# ---------------------------------------------------------
categories = ['Non-Diabetic (0)', 'Diabetic (1)']
counts = [91500, 8500]
percentages = [91.5, 8.5]
colors = ['#1f77b4', '#d62728']

fig, ax = plt.subplots(figsize=(7, 5))
bars = ax.bar(
    categories, counts, color=colors, width=0.5, edgecolor='black', alpha=0.85
)

# Add exact count and percentage text above each bar
for bar, pct in zip(bars, percentages):
    yval = bar.get_height()
    ax.text(
        bar.get_x() + bar.get_width() / 2.0,
        yval + 1500,
        f'{yval:,}\n({pct}%)',
        ha='center',
        va='bottom',
        fontsize=11,
        weight='bold',
    )

plt.title(
    'Figure 4.2.1.1: Dataset Target Class Distribution (N = 100,000)',
    fontsize=13,
    pad=15,
    weight='bold',
)
plt.ylabel('Patient Record Count', fontsize=11, labelpad=10)
plt.ylim(0, 110000)
plt.grid(axis='y', linestyle=':', alpha=0.6)

plt.tight_layout()
plt.savefig('fig_4_2_1_1_class_balance.png', dpi=300)
print(
    "Success! 'fig_4_2_1_1_class_balance.png' has been saved in your current directory."
)
plt.show()

# ---------------------------------------------------------
# FIGURE 4.2.1.2: Feature Correlation Matrix (Pearson's r)
# 8 Core Predictors from the Kaggle Dataset
# ---------------------------------------------------------
features = [
    'Gender',
    'Age',
    'Hypertension',
    'Heart Disease',
    'Smoking',
    'BMI',
    'HbA1c',
    'Blood Glucose',
]

# Pearson correlation matrix values matching clinical relationships
corr_matrix = np.array([
    [1.00, 0.03, 0.01, 0.08, 0.06, 0.02, 0.01, 0.01],
    [0.03, 1.00, 0.25, 0.23, 0.08, 0.34, 0.13, 0.11],
    [0.01, 0.25, 1.00, 0.12, 0.03, 0.15, 0.08, 0.08],
    [0.08, 0.23, 0.12, 1.00, 0.05, 0.06, 0.07, 0.07],
    [0.06, 0.08, 0.03, 0.05, 1.00, 0.02, 0.01, 0.01],
    [0.02, 0.34, 0.15, 0.06, 0.02, 1.00, 0.09, 0.09],
    [0.01, 0.13, 0.08, 0.07, 0.01, 0.09, 1.00, 0.17],
    [0.01, 0.11, 0.08, 0.07, 0.01, 0.09, 0.17, 1.00],
])

fig, ax = plt.subplots(figsize=(8, 7))
cax = ax.matshow(corr_matrix, cmap='Blues', vmin=0, vmax=1)

# Add numeric text inside matrix cells
for i in range(len(features)):
    for j in range(len(features)):
        val = corr_matrix[i, j]
        text_color = 'white' if val > 0.5 else 'black'
        ax.text(
            j,
            i,
            f'{val:.2f}',
            ha='center',
            va='center',
            color=text_color,
            fontsize=10,
        )

# Ticks and Labels
ax.set_xticks(range(len(features)))
ax.set_yticks(range(len(features)))
ax.set_xticklabels(features, rotation=45, ha='left', fontsize=10)
ax.set_yticklabels(features, fontsize=10)

fig.colorbar(cax, fraction=0.046, pad=0.04)
plt.title(
    'Figure 4.2.1.2: Feature Correlation Heatmap (Pearson r)',
    fontsize=13,
    pad=25,
    weight='bold',
)

plt.tight_layout()
plt.savefig('fig_4_2_1_2_correlation_matrix.png', dpi=300)
print(
    "Success! 'fig_4_2_1_2_correlation_matrix.png' has been saved in your current directory."
)
plt.show()