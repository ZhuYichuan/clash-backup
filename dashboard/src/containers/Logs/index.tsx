import dayjs from 'dayjs'
import { useLayoutEffect, useEffect, useRef, useState } from 'react'

import { Select, Card, Header } from '@components'
import { type Log } from '@models/Log'
import { useConfig, useGeneral, useI18n, useLogsStreamReader } from '@stores'

import './style.scss'

const logLevelOptions = [
    { label: 'Default', value: '' },
    { label: 'Debug', value: 'debug' },
    { label: 'Info', value: 'info' },
    { label: 'Warn', value: 'warning' },
    { label: 'Error', value: 'error' },
    { label: 'Silent', value: 'silent' },
]
const logMap = new Map([
    ['debug', 'text-teal-500'],
    ['info', 'text-sky-500'],
    ['warning', 'text-pink-500'],
    ['error', 'text-rose-500'],
])

export default function Logs () {
    const listRef = useRef<HTMLUListElement>(null)
    const logsRef = useRef<Log[]>([])
    const [logs, setLogs] = useState<Log[]>([])
    const { translation } = useI18n()
    const { data: { logLevel }, set: setConfig } = useConfig()
    const { general: { logLevel: configLevel } } = useGeneral()
    const { t } = translation('Logs')
    const logsStreamReader = useLogsStreamReader()
    const scrollHeightRef = useRef(listRef.current?.scrollHeight ?? 0)

    const isConfigSilent = configLevel?.toLowerCase() === 'silent'

    useLayoutEffect(() => {
        const ul = listRef.current
        if (ul != null && scrollHeightRef.current === (ul.scrollTop + ul.clientHeight)) {
            ul.scrollTop = ul.scrollHeight - ul.clientHeight
        }
        scrollHeightRef.current = ul?.scrollHeight ?? 0
    })

    useEffect(() => {
        function handleLog (newLogs: Log[]) {
            logsRef.current = logsRef.current.slice().concat(newLogs.map(d => ({ ...d, time: new Date() })))
            setLogs(logsRef.current)
        }

        if (logsStreamReader != null) {
            logsStreamReader.subscribe('data', handleLog)
            logsRef.current = logsStreamReader.buffer()
            setLogs(logsRef.current)
        }
        return () => logsStreamReader?.unsubscribe('data', handleLog)
    }, [logsStreamReader])

    return (
        <div className="page">
            <Header title={ t('title') } >
                <span className="mr-2 text-sm text-primary-darken">{t('levelLabel')}:</span>
                <Select
                    disabled={isConfigSilent}
                    options={logLevelOptions}
                    value={isConfigSilent ? 'silent' : logLevel}
                    onSelect={level => setConfig(c => { c.logLevel = level })}
                />
            </Header>

            <Card className="mt-2.5 flex flex-1 flex-col md:mt-4">
                <ul className="logs-panel" ref={listRef}>
                    {
                        logs.map(
                            (log, index) => (
                                <li className="inline-block text-[11px] leading-5" key={index}>
                                    <span className="mr-2 text-orange-400">[{ dayjs(log.time).format('YYYY-MM-DD HH:mm:ss') }]</span>
                                    <span className={logMap.get(log.type)}>[{ log.type.toUpperCase() }]</span>
                                    <span> { log.payload }</span>
                                </li>
                            ),
                        )
                    }
                </ul>
            </Card>
        </div>
    )
}
