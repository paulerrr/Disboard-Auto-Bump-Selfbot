require('dotenv').config()
const { Client } = require('discord.js-selfbot-v13')
const fs = require('fs')
const path = require('path')
const client = new Client()

const DATA_FILE = path.join(__dirname, 'bump-data.json')

function loadBumpData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
            return data.lastBumpTime || 0
        }
    } catch (error) {
        console.error('Error loading bump data:', error.message)
    }
    return 0
}

function saveBumpData(lastBumpTime) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ lastBumpTime }, null, 2))
    } catch (error) {
        console.error('Error saving bump data:', error.message)
    }
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`)

    const channel = await client.channels.fetch(process.env.BUMP_CHANNEL)
    let lastBumpTime = loadBumpData()
    const USER_COOLDOWN = 30 * 60 * 1000 // 30 minutes in milliseconds
    const DISBOARD_BOT_ID = '302050872383242240'

    if (lastBumpTime > 0) {
        const timeSinceLastBump = Date.now() - lastBumpTime
        const minutesAgo = Math.floor(timeSinceLastBump / 60000)
        console.log(`Last bump was ${minutesAgo} minutes ago`)
    }

    async function bump() {
        const now = Date.now()
        const timeSinceLastBump = now - lastBumpTime

        if (timeSinceLastBump < USER_COOLDOWN && lastBumpTime > 0) {
            const remainingTime = Math.ceil((USER_COOLDOWN - timeSinceLastBump) / 60000)
            console.log(`Skipping bump - user cooldown active. ${remainingTime} minutes remaining.`)
            return { success: false, cooldownMinutes: remainingTime }
        }

        try {
            console.log('Sending /bump command...')
            const message = await channel.sendSlash(DISBOARD_BOT_ID, 'bump')
            console.log('Received Disboard response')

            // Check for successful bump
            if (message.embeds && message.embeds.length > 0) {
                const embed = message.embeds[0]
                const description = embed.description || ''

                if (description.includes('Bump done!') || description.includes(':thumbsup:')) {
                    lastBumpTime = now
                    saveBumpData(lastBumpTime)
                    console.log('✓ Bump successful!')
                    return { success: true }
                } else if (description.includes('Please wait')) {
                    // Parse cooldown time from message like "Please wait another 106 minutes"
                    const match = description.match(/(\d+)\s+minute/)
                    const cooldownMinutes = match ? parseInt(match[1]) : null
                    console.log('⏳ Server cooldown active -', description)
                    return { success: false, cooldownMinutes }
                } else {
                    console.log('✗ Bump failed - Disboard response:', description.substring(0, 100))
                    return { success: false }
                }
            }

            console.log('⚠ Received unexpected response from Disboard (no embed)')
            return { success: false }

        } catch (error) {
            console.error('✗ Bump failed - Error:', error?.message || error)
            return { success: false }
        }
    }

    async function loop() {
        const result = await bump()

        let waitTime
        if (result.cooldownMinutes) {
            // If we got a cooldown, wait for that time + 1-30 minutes buffer for randomness
            const bufferMinutes = Math.floor(Math.random() * 30) + 1 // 1-30 minute buffer
            const totalMinutes = result.cooldownMinutes + bufferMinutes
            waitTime = totalMinutes * 60 * 1000
            console.log(`⏰ Scheduling next bump in ${totalMinutes} minutes (${result.cooldownMinutes}min cooldown + ${bufferMinutes}min buffer)`)
        } else {
            // Normal random interval: 2-2.5 hours to avoid detection
            waitTime = Math.round(Math.random() * (9000000 - 7200000 + 1)) + 7200000
            const waitMinutes = Math.round(waitTime / 60000)
            console.log(`⏰ Scheduling next bump in ${waitMinutes} minutes`)
        }

        setTimeout(loop, waitTime)
    }

    // Check if we should bump immediately or wait
    const SERVER_COOLDOWN = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    const timeSinceLastBump = Date.now() - lastBumpTime

    if (lastBumpTime === 0 || timeSinceLastBump >= SERVER_COOLDOWN) {
        // No previous bump or cooldown expired - bump immediately
        console.log('Starting bump cycle - bumping now...')
        loop()
    } else {
        // Wait for server cooldown to expire
        const waitTime = SERVER_COOLDOWN - timeSinceLastBump
        const waitMinutes = Math.ceil(waitTime / 60000)
        console.log(`Server cooldown active - waiting ${waitMinutes} minutes before first bump`)
        setTimeout(loop, waitTime)
    }
})

client.login(process.env.TOKEN)
