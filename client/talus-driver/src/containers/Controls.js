import { useState } from 'react'
import { RangeStepInput } from 'react-range-step-input';


const driveMotor = async (motor, speed) => {
    const body = {
        speed,
        motor
    }

    const response = await fetch('/api/drive/motor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    console.log(response)
}

const led = async (status) => {
    const body = {
        on: status
    }

    const response = await fetch('/api/led', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    console.log(response)
}

const halt = async () => {
    const response = await fetch('/api/drive/halt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    console.log(response)
}

export const Controls = () => {
    const [ledStatus, setLedStatus] = useState(false)
    const [speed, setSpeed] = useState(130)

    return (
        <div className="flex flex-col select-none">

            <div className="flex w-full h-full bg-black justify-around text-5xl ">
                <div className="flex flex-col">
                    <div onTouchStart={() => driveMotor('left', speed)} onTouchEnd={halt} className="bg-blue-500 p-9">
                        ⬆️
                    </div>

                    <div onTouchStart={() => driveMotor('left', speed * -1)} onTouchEnd={halt} className="bg-blue-500 p-9">
                        ⬇️
                </div>
                </div>
                <div className="flex flex-col">
                    <div onTouchStart={() => driveMotor('right', speed)} onTouchEnd={halt} className="bg-blue-500 p-9">
                        ⬆️
                </div>
                    <div onTouchStart={() => driveMotor('right', speed * -1)} onTouchEnd={halt} className="bg-blue-500 p-9">
                        ⬇️
                </div>
                </div>

            </div>
            <div>
                <button onClick={halt} className="text-3xl bg-red-500 text-white p-5">Stop</button>
                <button onClick={() => {
                    setLedStatus(!ledStatus)
                    led(ledStatus)
                }} className="text-3xl bg-green-500 text-white p-5">LED</button>
            </div>
            <div>
                <RangeStepInput min={1} max={255} value={speed} onChange={(x) => setSpeed(x.target.value)} step={1} />
                {speed}
            </div>
        </div>
    )
}