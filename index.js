const express = require('express')
const bodyParser = require('body-parser')
const { createComponents } = require('./src/arduino')

const app = express()

const PORT = 8080

async function main() {

    components = await createComponents()

    app.use(bodyParser.json())

    app.post('/api/led', (req, res) => {
        const { on } = req.body
        if (on) {
            components.led.on()
            res.send({ ledStatus: 'on' })
        } else {
            components.led.off()
            res.send({ ledStatus: 'off' })
        }
    })

    app.post('/api/drive/motor', (req, res) => {
        console.log(req.body)
        let { speed, motor } = req.body
        const motorDriver = components[motor]

        if (speed < 0) {
            motorDriver.fwd(speed * -1)
        } else {
            motorDriver.rev(speed)
        }

        res.send({
            message: `Driving ${motor} motor at ${speed}`
        })
    })

    app.post('/api/drive/path', (req, res) => {
        const { commands } = req.body
        components.path(commands)
        res.send({
            message: 'path accepted'
        })
    })

    app.post('/api/drive/halt', (req, res) => {
        components.left.stop()
        components.right.stop()
        res.send({
            message: 'stop command issued'
        })
    })

    app.listen(PORT, () => {
        console.log(`Express server listening on port ${PORT}`)
    })
}

main()
