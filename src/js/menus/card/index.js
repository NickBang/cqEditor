/*
    menu - card
*/
import $ from '../../util/dom-core.js'
import {getRandom} from '../../util/util.js'
import Panel from '../panel.js'

// 构造函数
function Card(editor) {
    this.editor = editor
    this.$elem = $(
        `<div class="w-e-menu">
            <i class="w-e-icon-book"></i>
        </div>`
    )
    this.type = 'panel'

    // 当前是否 active 状态
    this._active = false
}

Card.prototype = {
    constructor: Card,

    onClick: function () {
        this._createPanel()
    },

    // 根据 debug 弹出不同的信息
    _alert: function (alertInfo, debugInfo) {
        const editor = this.editor
        const debug = editor.config.debug
        const customAlert = editor.config.customAlert

        if (debug) {
            throw new Error('wangEditor: ' + (debugInfo || alertInfo))
        } else {
            if (customAlert && typeof customAlert === 'function') {
                customAlert(alertInfo)
            } else {
                alert(alertInfo)
            }
        }
    },

    insertCard: function (data, obj) {
        console.log(data)
        this.editor.cmd.do('insertHTML',
            '<br><div contenteditable="false" class="cq-card" value="'+ obj.id +'" type="'+ obj.type +'" onmouseover="overIndex(this)" onmouseout="outIndex(this)">' +
            '<div style="width: 100px;"><img style="width: 100%;" src="'+ data.coverPath +'" alt=""></div>' +
            '<div style="width: 190px;margin-left: 10px;"><p>'+ data.name +'</p></div>' +
            '<img onclick="closeCard(this)" class="cq-close-icon" src="http://koalareading-demo.oss-cn-beijing.aliyuncs.com/img/cq-close-icon.png" alt="">' +
            '</div><br>'
        )
    },

    _createPanel: function () {
        // 创建卡片随机id
        const cardId = getRandom('card')
        const textValId = getRandom('text-val')
        const btnId = getRandom('btn')

        // 创建 panel
        const panel = new Panel(this, {
            width: 500,
            // 一个 panel 多个 tab
            tabs: [
                {
                    // 标题
                    title: '添加内容卡片',
                    // 模板
                    tpl: `<div>
                            <select id="${cardId}" class="w-e-card-select">
                                <option value="1">书籍</option>
                                <option value="2">音频专辑</option>
                                <option value="3">文章专栏</option>
                                <option value="4">作者</option>
                            </select>
                            <input type="text" placeholder="请输入对应内容id" id="${textValId}" class="block">
                            <div class="w-e-card-update" id="${btnId}"></div>
                          </div>`,
                    // 事件绑定
                    events: [
                        {
                            // 触发选择卡片类型select
                            selector: '#' + btnId,
                            type: 'click',
                            fn: () => {
                                // 输入的图书id
                                const $val = $('#' + textValId)
                                // 选择的图书类型
                                const $card = $('#' + cardId)
                                // console.log($val.val())
                                // console.log($card.val())
                                if ($val.val().length === 0) {
                                    // 返回true 关闭
                                    return true
                                } else {
                                    let obj = {
                                        id: $val.val(),
                                        type: $card.val()
                                    }
                                    this.searchBook($val.val(), $card.val()).then(res => {
                                        // 将选择的卡片类型带进去  cardType
                                        // res.content.cardType = $card.val()
                                        this.insertCard(res.content, obj)
                                    })
                                    // 关闭 panel
                                    return true
                                }

                            }
                        }
                    ]
                }
            ] // tabs end
        }) // panel end

        // 显示 panel
        panel.show()

        // 记录属性
        this.panel = panel
    },
    searchBook(id, type) {
        // ------配置信息-------
        const editor = this.editor
        const config = editor.config
        const timeout = 3000
        const hooks = {}
        let withCredentials = config.withCredentials
        if (withCredentials == null) {
            withCredentials = false
        }
        let searchBookServer = config.searchBookServer + id

        return new Promise((resolve, reject) => {

            // 定义 xhr
            const xhr = new XMLHttpRequest()
            xhr.open('GET', searchBookServer)

            // 设置超时
            xhr.timeout = timeout
            xhr.ontimeout = () => {
                this._alert('查询书籍超时')
            }

            // 返回数据
            xhr.onreadystatechange = () => {
                let result
                if (xhr.readyState === 4) {
                    if (xhr.status < 200 || xhr.status >= 300) {

                        // xhr 返回状态错误
                        this._alert('查询发生错误', `服务器返回状态是 ${xhr.status}`)
                        return
                    }

                    result = xhr.responseText
                    if (typeof result !== 'object') {
                        try {
                            result = JSON.parse(result)
                        } catch (ex) {

                            this._alert('失败', '返回结果错误，返回结果是: ' + result)
                            return
                        }
                    }
                    // console.log(result)
                    if (!result.success) {
                        // 数据错误
                        this._alert('失败', '返回结果错误，返回结果 error=' + result.message)
                    } else {
                        resolve(result)
                    }
                }
            }

            // 跨域传 cookie
            xhr.withCredentials = withCredentials

            // 发送请求
            xhr.send()
        })
    }
}
export default Card
