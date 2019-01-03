/*
    menu - video
*/
import $ from '../../util/dom-core.js'
import { getRandom } from '../../util/util.js'
import Panel from '../panel.js'

// 构造函数
function Video(editor) {
    this.editor = editor
    console.log('this.editor', this.editor)
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-play"></i></div>')
    this.type = 'panel'

    // 当前是否 active 状态
    this._active = false
}

// 原型
Video.prototype = {
    constructor: Video,

    onClick: function () {
        this._createPanel()
    },

    _createPanel: function () {
        const uploadVideo = editor.uploadVideo
        // 创建 id
        const upTriggerId = getRandom('up-trigger')
        const upFileId = getRandom('up-file')
        const textValId = getRandom('text-val')
        const btnId = getRandom('btn')

        // 创建 panel
        const panel = new Panel(this, {
            width: 350,
            // 一个 panel 多个 tab
            tabs: [
                {
                    // 标题
                    title: '插入视频',
                    // 模板
                    tpl: `<div>
                        <input id="${textValId}" type="text" class="block" placeholder="格式如：<iframe src=... ><\/iframe>"/>
                        <div class="w-e-button-container">
                            <button id="${btnId}" class="right">插入</button>
                        </div>
                    </div>`,
                    // 事件绑定
                    events: [
                        {
                            selector: '#' + btnId,
                            type: 'click',
                            fn: () => {
                                const $text = $('#' + textValId)
                                const val = $text.val().trim()

                                // 测试用视频地址
                                // <iframe height=498 width=510 src='http://player.youku.com/embed/XMjcwMzc3MzM3Mg==' frameborder=0 'allowfullscreen'></iframe>

                                if (val) {
                                    // 插入视频
                                    this._insert(val)
                                }

                                // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                                return true
                            }
                        }
                    ]
                }, // first tab end
                {
                    // 标题
                    title: '插入视频',
                    // 模板
                    tpl: `<div class="w-e-up-img-container">
                    <div id="${upTriggerId}" class="w-e-up-btn">
                        <i class="w-e-icon-upload2"></i>
                    </div>
                    <div style="display:none;">
                        <input id="${upFileId}" type="file" accept="audio/mpeg,audio/mp4,video/mp4"/>
                    </div>
                </div>`,
                    // 事件绑定
                    events: [
                        {
                            // 触发选择图片
                            selector: '#' + upTriggerId,
                            type: 'click',
                            fn: () => {
                                const $file = $('#' + upFileId)
                                console.log($file)
                                const fileElem = $file[0]
                                if (fileElem) {
                                    fileElem.click()
                                } else {
                                    // 返回 true 可关闭 panel
                                    return true
                                }
                            }
                        },
                        {
                            // 选择图片完毕
                            selector: '#' + upFileId,
                            type: 'change',
                            fn: () => {
                                const $file = $('#' + upFileId)
                                const fileElem = $file[0]
                                if (!fileElem) {
                                    // 返回 true 可关闭 panel
                                    return true
                                }

                                // 获取选中的 file 对象列表
                                const fileList = fileElem.files
                                if (fileList.length) {
                                    uploadVideo.uploadVideo(fileList)
                                }

                                // 返回 true 可关闭 panel
                                return true
                            }
                        }
                    ]
                } // second tab end
            ] // tabs end
        }) // panel end

        // 显示 panel
        panel.show()

        // 记录属性
        this.panel = panel
    },

    // 插入视频
    _insert: function (val) {
        const editor = this.editor
        editor.cmd.do('insertHTML', val + '<p><br></p>')
    }
}

export default Video
