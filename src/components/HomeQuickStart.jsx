const samplePassage = {
  id: "sample-low-vision-text",
  title: "Low Vision Text Test",
  sentences: [
    "Mr. Kim studies science.",
    "Technology helps people in many areas.",
    "For example, robots can clean rooms.",
  ],
  createdAt: new Date(),
};

function HomeQuickStart({ theme, onThemeChange, onNewPassage, onStartSample }) {
  return (
    <section className="home-quick-start" aria-label="LingoStar Vision Reader quick start">
      <div className="home-quick-header">
        <h2>LingoStar Vision Reader</h2>
        <label>
          <span className="sr-only">&#54868;&#47732; &#49353;&#49345; &#49440;&#53469;</span>
          <select value={theme} onChange={(event) => onThemeChange(event.target.value)}>
            <option value="light">Light</option>
            <option value="yellow">Yellow</option>
            <option value="blue-soft">Blue Soft</option>
            <option value="dark">Dark</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </label>
      </div>

      <div className="home-quick-actions">
        <button className="quick-action-primary" type="button" onClick={onNewPassage}>
          &#49352; &#51648;&#47928; &#51077;&#47141;&#54616;&#44592;
        </button>
        <button className="quick-action-success" type="button" onClick={() => onStartSample(samplePassage)}>
          &#54200;&#51665; &#51473; &#53581;&#49828;&#53944; &#53580;&#49828;&#53944; (&#51200;&#49884;&#47141;)
        </button>
        <div className="home-mode-grid">
          <button type="button" onClick={() => onThemeChange("high-contrast")}>
            &#51665;&#51473; &#51069;&#44592; &#47784;&#46300;
          </button>
          <button type="button" onClick={() => onThemeChange("blue-soft")}>
            &#52572;&#51201;&#54868; &#47784;&#46300;
          </button>
        </div>
      </div>
    </section>
  );
}

export default HomeQuickStart;