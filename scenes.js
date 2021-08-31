const { time, clear } = require('console');
const exp = require('constants');
const { Scenes, Markup } = require('telegraf') 

const mailingKeyboardStart = Markup.keyboard([
    ['Старт✅'],['Стоп❌'],['Настройки⚙️']
]).resize()

const varificationkeyboard = Markup.inlineKeyboard([
    Markup.button.callback('Готово!', 'varification')
])

let upperTime;
let lowerTime;

let hourCounter = 8;
let glassful = 0;

class SceneGenerator {

    GenUpperLimitScene () {
        const messageUpperLimit = new Scenes.BaseScene('upperLimit')
        messageUpperLimit.enter(async (ctx) => {
            await ctx.reply('Начиная со скольки часов мне отправлять напоминания?')
        })
        messageUpperLimit.on('text', async (ctx) => {
            upperTime = Number(ctx.message.text)
            if (upperTime) {
                await ctx.reply('Рассылка начнется с ' + upperTime + ' часов(а)')
                await ctx.scene.enter('lowerLimit')
            } else {
                await ctx.reply('Ты пытаешься меня запутать! Пожалуйста, введи число от 0 до 24.')
                await ctx.scene.reenter()
            }
        })
        messageUpperLimit.on('message', (ctx) => ctx.reply('Попроуй написать число, и ничего больше!'))
        return messageUpperLimit
    }


    GenLowerLimitScene() {
        const messageLowerLimit = new Scenes.BaseScene('lowerLimit')
        messageLowerLimit.enter(async (ctx) => {
            await ctx.reply('До скольки мне отправлять напоминания?')
        })
        messageLowerLimit.on('text', async (ctx) => {
            lowerTime = Number(ctx.message.text)
            if (lowerTime) {
                await ctx.reply('Рассылка закончится в ' + lowerTime + ' часов(а)')
                await ctx.reply('Молодец! Теперь запусти рассылку, и каждый час тебе будет приходить сообщение с напоминанием выпить стакан воды! Изменить временные промежутки ты можешь остановив рассылку и прописав /settings.', mailingKeyboardStart)
                await ctx.scene.leave()
            } else {
                await ctx.reply('Ты снова меня обманываешь! Введи число от 0 до 24, и ничего больше!')
                await ctx.scene.reenter()
            }
        })
        messageLowerLimit.on('message', (ctx) => ctx.reply('Прекрати! В настройках вводи только числа от 0 до 24!'))
        return messageLowerLimit
    }

    GenMailingScene() {
        const mailingMessage = new Scenes.BaseScene('Mailing')
        let hourTimer;
        let messageTimer;
        mailingMessage.enter(async (ctx) => {
            await ctx.reply('Рассылка включена!')
            hourTimer = setInterval(hourAdding, 10000); // час = 3600000 мсек
            function hourAdding() {
                hourCounter++;
                console.log(hourCounter)
            
                if (hourCounter == 24) {
                    hourCounter = 0;
                }

                if (hourCounter >= upperTime && hourCounter <= lowerTime) {
                    ctx.reply('Выпей стакан воды!', varificationkeyboard)

                    mailingMessage.action('varification', async (ctx) => {
                        await ctx.reply('👍')
                        glassful++;
                    })
                } else  clearInterval(messageTimer)

                if (hourCounter == lowerTime+1) {
                    if (glassful >= 7) ctx.reply('Молодец! За сегодня ты выпил ' + glassful + ' стакана(ов) воды. Держи медальку! 🥇')
                    if (glassful >= 4 && glassful < 7) ctx.reply('Неплохо! За сегодня ты выпил ' + glassful + ' стакана(ов) воды. Старайся пить больше! 🥈')
                    if (glassful > 0 && glassful < 4) ctx.reply('Ужас! За сегодня ты выпил ' + glassful + ' стакана(ов) воды. Ты дожен пить гораздо больше! 🥉')
                    if (glassful == 0) ctx.reply('Ты вообще здесь? 💩')
                } 
            }  
        })
        mailingMessage.hears('Стоп❌', async (ctx) => {
            clearInterval(messageTimer);
            clearInterval(hourTimer);
            ctx.scene.leave()
            await ctx.reply('Рассылка выключена')
        })
        mailingMessage.on('message', (ctx) => ctx.reply('Если хочешь изменить настройки рассылки, сперва отключи рассылку'))
        return mailingMessage
    }
}

module.exports = SceneGenerator