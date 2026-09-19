function getMode(mode) {
  return (req, res) => res.json({ mode });
}

module.exports = { getMode };
