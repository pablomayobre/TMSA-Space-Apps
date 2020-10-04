const app = require("express")()

require("./bot")

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || 3000, () => {
  console.log("WEB: Express configurado exitósamente.")
})