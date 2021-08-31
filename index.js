require('dotenv').config();
const SceneGenerator = require('./scenes')
const { Telegraf, Markup, Scenes, session } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('⚙️Настройки', 'timeSettings')]
])

const timeScene = new SceneGenerator()
const upperLimitScene = timeScene.GenUpperLimitScene()
const lowerLimitScene = timeScene.GenLowerLimitScene()
const mailingScene = timeScene.GenMailingScene()

const stage = new Scenes.Stage([upperLimitScene, lowerLimitScene, mailingScene])

bot.use(session())
bot.use(stage.middleware())

bot.command('/settings', async (ctx) => ctx.scene.enter('upperLimit'))
bot.help((ctx) => ctx.reply('Введи /settings чтобы изменить настройки рассылки'))
bot.start(async (ctx) => {
    await ctx.reply('Привет, ' + ctx.message.from.first_name + '! Если ты пьешь мало воды, то я помогу тебе! От тебя требуется лишь настроить меня!⬇', keyboard)
})

bot.action('timeSettings', async (ctx) => {
    ctx.scene.enter('upperLimit')
})

bot.hears('Старт✅', (ctx) => {
    ctx.scene.enter('Mailing')
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))