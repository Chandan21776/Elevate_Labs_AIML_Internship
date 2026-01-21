const observations = [
    "Titanic dataset contains missing values in Age, Cabin, and Embarked columns.",
    "Cabin column has a large number of null values and may need to be dropped.",
    "Survival classes are slightly imbalanced.",
    "Students Performance dataset has no missing values.",
    "Score values are well distributed and suitable for regression models.",
    "Categorical variables require encoding before ML modeling."
];

const list = document.getElementById("observations");

observations.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
});

document.getElementById("mlResult").textContent =
    "Both datasets are suitable for machine learning after basic preprocessing such as handling missing values, encoding categorical variables, and feature scaling.";