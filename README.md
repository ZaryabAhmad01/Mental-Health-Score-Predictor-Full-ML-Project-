# Mental-Health-Score-Predictor-Full-ML-Project-
# 🧠 Mental Health Score Predictor

An end-to-end machine learning project that predicts a person's **mental health score** from their digital habits, academic life, and lifestyle patterns — built with a scikit-learn model, a FastAPI backend, and a custom-designed vanilla JS frontend.

> ⚠️ **Disclaimer:** This tool provides a data-driven estimate, not a clinical diagnosis. If you or someone you know is struggling, please reach out to a mental health professional or a trusted support line.

---

## 📸 Preview

*(Add a screenshot or GIF of the app here — e.g. `assets/demo.png`)*

---

## ✨ Features

- 🔮 Predicts a **Mental Health Score (0–10)** from 12 lifestyle and digital-habit inputs
- ⚡ **FastAPI** backend serving a trained ML model via a `/predict` REST endpoint
- 🎨 Custom **dark-glassmorphism UI** with floating labels, an animated "breathing orb" progress indicator, live form validation, and toast notifications
- 📱 Fully responsive — works on desktop, tablet, and mobile
- 🧪 Input validation on both the frontend (instant feedback) and backend (Pydantic schema)

---

## 🗂️ Project Structure

```
Mental Health Score Predictor (Full ML Project)/
│
├── main.py                    # FastAPI backend — loads the model & serves /predict
├── model.ipynb                # Notebook: EDA, preprocessing, training, evaluation
├── Mental_Health_Model.pkl    # Trained & serialized ML model (joblib)
├── requirements.txt           # Python dependencies
│
├── index.html                 # Frontend UI
├── style.css                  # Styling (dark glassmorphism theme)
├── script.js                  # Frontend logic (validation, API calls, animations)
│
└── README.md
```

---

## 🧰 Tech Stack

| Layer        | Technology                                   |
|--------------|-----------------------------------------------|
| Model        | scikit-learn, pandas, joblib                  |
| Backend      | FastAPI, Pydantic, Uvicorn                    |
| Frontend     | HTML5, CSS3, Vanilla JavaScript (Fetch API)   |
| Notebook     | Jupyter / model.ipynb                         |

---

## 📊 Model Performance

| Metric        | Score |
|---------------|-------|
| **Accuracy**  | **88%** |

The model was trained on a dataset of student social-media usage and lifestyle habits, using features such as age, gender, country, academic level, platform usage, daily unlocks, study hours, physical activity, sleep, and self-reported stress level to predict a continuous mental health score.

> Full training steps, feature engineering, and evaluation metrics are documented in [`model.ipynb`](./model.ipynb).

---

## 🔌 API Reference

**Base URL:** `http://127.0.0.1:8000`

### `GET /`
Health check — confirms the API is running.

### `POST /predict`
Runs a prediction against the loaded model.

**Request body:**

```json
{
  "Age": 21,
  "Gender": "Male",
  "Country": "India",
  "Academic_Level": "Undergraduate",
  "Most_Used_Platform": "Instagram",
  "Purpose_Of_Use": "Entertainment",
  "Avg_Daily_Usage_Hours": 4.5,
  "Daily_Unlocks": 60,
  "Study_Hours": 3,
  "Physical_Activity_Hours": 1,
  "Sleep_Hours_Per_Night": 6.5,
  "Stress_Level": "Medium"
}
```

**Success response — `200 OK`:**

```json
{ "Predict": "your Mental Health Score is 7.2" }
```

**Error responses:**

| Status | Cause                              |
|--------|-------------------------------------|
| `422`  | Invalid input (fails Pydantic schema validation) |
| `500`  | Model not loaded, or prediction raised an exception |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd "Mental Health Score Predictor (Full ML Project)"
```

### 2. Set up the backend

```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload
```

The API will start at `http://127.0.0.1:8000`.

### 3. Run the frontend

Simply open `index.html` in your browser (or serve it with any static file server).

> The frontend is pre-configured to call `http://127.0.0.1:8000/predict`. If you deploy the backend elsewhere, update `API_BASE_URL` at the top of `script.js`.

CORS is already enabled on the backend (`allow_origins=["*"]`), so no extra configuration is needed for local development.

---

## 🧑‍💻 Input Fields

| Field                      | Type    | Constraints                                  |
|-----------------------------|---------|-----------------------------------------------|
| Age                        | int     | 10 < age ≤ 110                                |
| Gender                     | enum    | Male, Female                                  |
| Country                    | string  | Grouped as "Other" if outside top 10 countries |
| Academic Level             | enum    | High School, Undergraduate, Graduate          |
| Most Used Platform         | enum    | Facebook, Instagram, TikTok, Twitter, Snapchat, YouTube, LinkedIn, WhatsApp, WeChat, LINE, KakaoTalk, VKontakte |
| Purpose of Use             | enum    | Networking, Education, Entertainment, News    |
| Avg. Daily Usage (hrs)     | float   | 0 < hrs ≤ 24                                   |
| Daily Unlocks              | int     | > 0                                            |
| Study Hours                | float   | 0 < hrs ≤ 24                                   |
| Physical Activity (hrs)    | float   | 0 < hrs ≤ 24                                   |
| Sleep Hours / Night        | float   | 0 < hrs ≤ 24                                   |
| Stress Level               | enum    | Low, Medium, High, Very High                  |

---

## 🛣️ Roadmap

- [ ] Deploy backend (Render / Railway / AWS)
- [ ] Deploy frontend (Vercel / Netlify)
- [ ] Add authentication & result history
- [ ] Add SHAP-based explainability for predictions

---

## 👤 Author

**Zaryab** — AI/ML Engineer @ AIHOUSE

---

## 📄 License

This project is licensed under the MIT License — feel free to use and adapt it.
