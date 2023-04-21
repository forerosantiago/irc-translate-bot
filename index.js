const fs = require('fs')
const translate = require('@iamtraction/google-translate')

const config = JSON.parse(fs.readFileSync('config.json'))

const channels = require('./channels.json').channels

const irc = require('irc')
const client = new irc.Client(config.server, config.nick, {
  channels
})

console.log(config.server, config.nick)

client.on('message', (nick, to, text, message) => {
  const lowercase = text.toLowerCase()
  if (lowercase === '-help' || lowercase === `${config.nick.toLowerCase()} help` || lowercase === config.nick.toLowerCase()) {
    client.say(to, `${nick}: Hello, I'm a translation bot developed by forero, translate to your desired language using the ISO 639-1 code like this: -es Text to be translated. Note: if the iso code is invalid I will not respond.`)
    client.say(to, 'I can join any channel you want! just invite me using the the /invite command and I\'ll join immediately :) if you want me to stop joining your channel just kick me and I won\'t come back. My source code is available at https://github.com/forerosantiago/irc-translate-bot')
  } else if (lowercase.startsWith('-')) {
    const iso = lowercase.slice(1).trim().split(/ +/)[0]
    translate(text, { to: iso }).then(res => {
      client.say(to, res.text.slice(1 + iso.length))
      console.log(res)
    }).catch(err => {
      console.error(err)
    })
  }
})

client.on('invite', (channel, from, message) => {
  client.join(message.args[1])

  const data = JSON.parse(fs.readFileSync('channels.json'))
  data.channels.push(message.args[1])
  fs.writeFileSync('channels.json', JSON.stringify(data))
})

client.on('kick', (channel, nick, by, reason, message) => {
  if (message.args[1] === config.nick) {
    const data = JSON.parse(fs.readFileSync('channels.json'))
    data.channels = data.channels.filter(item => item !== channel)
    fs.writeFileSync('channels.json', JSON.stringify(data))
  }
})

client.addListener('error', function (message) {
  console.log('error: ', message)
})