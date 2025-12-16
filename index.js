const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>BMI Calculator</title>
      <style>
        body { font-family: Arial, sans-serif; background:#f3f4f6; margin:0; padding:40px; }
        .card { max-width: 420px; margin: 0 auto; background: #fff; padding: 22px; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
        h2 { margin: 0 0 12px; }
        label { display:block; margin-top: 12px; font-weight: 600; }
        input { width: 100%; padding: 10px; margin-top: 6px; border: 1px solid #ddd; border-radius: 8px; }
        button { width:100%; margin-top: 16px; padding: 10px; border:0; border-radius: 8px; background:#2563eb; color:#fff; font-weight:700; cursor:pointer; }
        button:hover { opacity: 0.95; }
        .hint { color:#6b7280; font-size: 12px; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>BMI Calculator</h2>
        <form action="/bmi" method="POST">
          <label>Weight (kg)</label>
          <input type="number" name="weight" step="0.1" required />
          <label>Height</label>
          <input type="number" name="height" step="0.01" required />
          <button type="submit">Calculate</button>
        </form>
      </div>
    </body>
    </html>
  `);
});
app.post("/bmi", (req, res) => {
  const weight = parseFloat(req.body.weight);
  let height = parseFloat(req.body.height);
  if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) {
    return res.send(`<p>Invalid input. Please enter positive numbers.</p><a href="/">Back</a>`);
  }
  if (height > 3) height = height / 100;
  const bmi = weight / (height * height);
  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";
  res.send(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>BMI Result</title>
      <style>
        body { font-family: Arial, sans-serif; background:#f3f4f6; margin:0; padding:40px; }
        .card { max-width: 420px; margin: 0 auto; background: #fff; padding: 22px; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
        a { display:inline-block; margin-top: 14px; text-decoration:none; color:#2563eb; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>BMI Result</h2>
        <p><strong>BMI:</strong> ${bmi.toFixed(2)}</p>
        <p><strong>Category:</strong> ${category}</p>
        <a href="/">← Back</a>
      </div>
    </body>
    </html>
  `);
});
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});