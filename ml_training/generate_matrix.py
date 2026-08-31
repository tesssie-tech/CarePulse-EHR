import matplotlib.pyplot as plt
import numpy as np

# Matrix data from your test set results
cm = np.array([[11581, 614], [514, 2291]])

# Label formatting
labels = [
    ['True Negatives\n11,581', 'False Positives\n614'],
    ['False Negatives\n514', 'True Positives\n2,291'],
]

# Create plot using pure matplotlib
fig, ax = plt.subplots(figsize=(7, 6))

# Custom blue color shading matrix
colors = np.array([[0.2, 0.6], [0.8, 0.4]])
cax = ax.matshow(cm, cmap='Blues')

# Add text annotations inside each box
for i in range(2):
    for j in range(2):
        text_color = 'white' if cm[i, j] > 5000 else 'black'
        ax.text(
            j,
            i,
            labels[i][j],
            ha='center',
            va='center',
            color=text_color,
            fontsize=13,
            weight='bold',
        )

# Set ticks and axis labels
ax.set_xticks([0, 1])
ax.set_yticks([0, 1])
ax.set_xticklabels(['Predicted Negative', 'Predicted Positive'], fontsize=11)
ax.set_yticklabels(['Actual Negative', 'Actual Positive'], fontsize=11)

plt.title('Test Set Confusion Matrix', fontsize=15, pad=20, weight='bold')
plt.xlabel('Predicted Label', fontsize=12, labelpad=10)
plt.ylabel('True Label', fontsize=12, labelpad=10)

plt.tight_layout()

# Save image file to your folder
plt.savefig('confusion_matrix.png', dpi=300)
print(
    "Success! 'confusion_matrix.png' has been saved in your current directory."
)
plt.show()