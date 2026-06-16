export default function LogFind() {
  return (
    <section className="workspace-page">
      <div className="workspace-header">
        <p className="eyebrow">Log a find</p>
        <h1>Record the field moment</h1>
        <p>Sketch out the form for saving a find while the memory is fresh.</p>
      </div>
      <form className="auth-form profile-form">
        <div className="form-grid">
          <label>
            Find name
            <input placeholder="Blue lace agate" />
          </label>
          <label>
            Location
            <input placeholder="Beach, river, claim, or region" />
          </label>
          <label>
            Date found
            <input type="date" />
          </label>
          <label>
            Mineral type
            <input placeholder="Agate, jasper, quartz..." />
          </label>
        </div>
        <label>
          Field notes
          <textarea rows={5} placeholder="Weather, host rock, access notes, companions, and first impressions." />
        </label>
        <div className="form-footer">
          <span>Draft-only UI while auth settles.</span>
          <button type="button">Save draft</button>
        </div>
      </form>
    </section>
  )
}
