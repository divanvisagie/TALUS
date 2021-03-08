const five = require('johnny-five')
const SerialPort = require('serialport')

const { map } = require('ramda')

const xbee_api = require('xbee-api')
let atSpeed = 100
const xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 1
});

xbeeAPI.on("frame_object", function (frame) {
    console.log("OBJ> " + util.inspect(frame))
})



const degreesToTime = (degrees) => {
    return degrees * (atSpeed / 7)
}


const turn = (motor, degrees) => {
    return new Promise((resolve, reject) => {
        if (degrees > 0) {
            motor.rev(atSpeed)
        }
        else {
            console.log('reverse')
            degrees = degrees * -1
            motor.fwd(atSpeed)
        }

        const time = degreesToTime(degrees)

        setTimeout(() => {
            motor.stop()
            resolve()
        }, time)
    })
}

const createPathFollower = async (leftMotor, rightMotor, led) => {

    const execute = async (command) => {
        const [instruction, value] = command
        const commandPallette = {
            'left': async (v) => {
                return await Promise.all([
                    turn(rightMotor, v),
                    turn(leftMotor, v * -1)
                ])
            },
            'right': async (v) => {
                return await Promise.all([
                    turn(rightMotor, v * -1),
                    turn(leftMotor, v)
                ])
            },
            'drive': async (v) => {

                return await Promise.all([
                    turn(rightMotor, v),
                    turn(leftMotor, v)
                ])
            },
            'wait': (v) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve()
                    }, v)
                })
            },
            'led': (v) => {
                return new Promise((resolve) => {
                    if (v) led.on()
                    else led.off()
                    resolve()
                })
            }
        }
        if (commandPallette[instruction]) {
            return await commandPallette[instruction](value)
        } else {
            throw Error('command not found')
        }
    }

    return async (commands) => {

        for (const command of commands) {
            await execute(command)
        }
    }
}

const createComponents = () => {
    return new Promise((resolve, reject) => {
        const board = new five.Board({
            port: new SerialPort("/dev/tty.usbserial-DA00SPFW", {
                baudRate: 57600,
                parser: xbeeAPI.rawParser()
            })
        })
        board.on('ready', async () => {
            const led = new five.Led({ pin: 13 })
            const leftMotor = new five.Motor([10, 8])
            const rightMotor = new five.Motor([9, 7])
            const path = await createPathFollower(leftMotor, rightMotor, led)

            const components = {
                left: leftMotor,
                right: rightMotor,
                turn,
                led,
                speed: (spd) => atSpeed = spd,
                path
            }
            board.repl.inject(components);
            resolve(components)
        })
    })
}


module.exports = {
    createComponents
}