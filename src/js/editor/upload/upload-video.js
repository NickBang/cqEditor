/*
    上传视频
*/

import { objForEach, arrForEach, percentFormat } from '../../util/util.js'
import Progress from './progress.js'
import { UA } from '../../util/util.js'

// 构造函数
function UploadVideo(editor) {
    this.editor = editor
}

// 原型
UploadVideo.prototype = {
    constructor: UploadVideo,

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

    // 根据链接插入视频、音频
    insertLinkVideo: function (link, type) {
        if (!link) {
            return
        }
        const editor = this.editor
        const config = editor.config

        // 校验格式
        const linkImgCheck = config.linkImgCheck
        let checkResult
        if (linkImgCheck && typeof linkImgCheck === 'function') {
            checkResult = linkImgCheck(link)
            if (typeof checkResult === 'string') {
                // 校验失败，提示信息
                alert(checkResult)
                return
            }
        }
        // type 区分音频视频(&nbsp;只是为了contenteditable="false"时给标签尾部站位,否则光标选取不到视频尾部,最后处理数据统一剔除&nbsp;)
        if (type === 'video') {
            editor.cmd.do('insertHTML',
                // '<p id="cq_video"><video onmouseover="overIndex()" width="200px" src="' + link + '" controls="controls"></video></p>'
                '<br><div contenteditable="true" class="cq-video" onmouseover="overIndex(this)" onmouseout="outIndex(this)">' +
                '<p contenteditable="false">' +
                '<img onclick="closeVideo(this)" class="cq-close-icon" src="http://koalareading-demo.oss-cn-beijing.aliyuncs.com/img/cq-close-icon.png" alt="">' +
                '<video src="'+ link +'" controls="controls"></video>' +
                '</p>' +
                '</div>&nbsp;'
            )
        } else {
            editor.cmd.do('insertHTML',
                // '&nbsp;<audio src="' + link + '" controls="controls"></audio>&nbsp;'
                '<br><div contenteditable="true" class="cq-audio" onmouseover="overIndex(this)" onmouseout="outIndex(this)">' +
                '<p contenteditable="false">' +
                '<img onclick="closeVideo(this)" class="cq-close-icon" src="http://koalareading-demo.oss-cn-beijing.aliyuncs.com/img/cq-close-icon.png" alt="">' +
                '<audio src="'+ link +'" controls="controls"></audio>' +
                '</p>' +
                '</div>&nbsp;'
            )
        }


        // 验证图片 url 是否有效，无效的话给出提示
        let video
        if (type === 'video') {
            video = document.createElement('video')
        } else {
            video = document.createElement('audio')
        }
        // video.onload = () => {
        //     const callback = config.linkImgCallback
        //     if (callback && typeof callback === 'function') {
        //         callback(link)
        //     }
        //
        //     video = null
        // }
        // video.onerror = () => {
        //     video = null
        //     // 无法成功下载图片
        //     this._alert('插入文件错误', `wangEditor: 插入文件出错，图片链接是 "${link}"，下载该链接失败`)
        //     return
        // }
        // video.onabort = () => {
        //     video = null
        // }
        video.src = link
    },

    // 上传视频 type( audio,  video )
    uploadVideo: function (files, type) {
        if (!files || !files.length) {
            return
        }

        // ------------------------------ 获取配置信息 ------------------------------
        const editor = this.editor
        const config = editor.config
        console.log('config', config)
        let uploadVideoServer = config.uploadVideoServer
        // 获取视频音频限制大小 可在config.js中修改
        const vMaxSize = config.uploadVideoMaxSize
        const vMaxSizeM = vMaxSize / 1024 / 1024
        const aMaxSize = config.uploadAudioMaxSize
        const aMaxSizeM = aMaxSize / 1024 / 1024
        const maxLength = config.uploadImgMaxLength || 10000
        const uploadFileName = config.uploadFileName || ''
        const uploadImgParams = config.uploadImgParams || {}
        const uploadImgParamsWithUrl = config.uploadImgParamsWithUrl
        const uploadImgHeaders = config.uploadImgHeaders || {}
        const hooks = config.uploadVideoHooks || {}
        const timeout = config.uploadImgTimeout || 3000
        let withCredentials = config.withCredentials
        if (withCredentials == null) {
            withCredentials = false
        }
        const customUploadVideo = config.customUploadVideo

        // ------------------------------ 验证文件信息 ------------------------------
        const resultFiles = []
        let errInfo = []
        arrForEach(files, file => {
            var name = file.name
            var size = file.size

            // chrome 低版本 name === undefined
            if (!name || !size) {
                return
            }

            if (/\.(mp3|mp4)$/i.test(name) === false) {
                // 后缀名不合法，不是视频
                errInfo.push(`【${name}】不是视频/音频文件`)
                return
            }

            if (type === 'video') {
                console.log(vMaxSize, size)
                if (vMaxSize < size) {
                    // 上传视频过大
                    errInfo.push(`【${name}】大于 ${vMaxSizeM}M`)
                    return
                }
            } else if (type === 'audio') {
                if (aMaxSize < size) {
                    // 上传音频过大
                    errInfo.push(`【${name}】大于 ${aMaxSizeM}M`)
                    return
                }
            }


            // 验证通过的加入结果列表
            resultFiles.push(file)
        })
        // 抛出验证信息
        if (errInfo.length) {
            // this._alert('文件验证未通过: \n' + errInfo.join('\n'))
            alert('文件验证未通过: \n' + errInfo.join('\n'))
            return
        }
        // if (resultFiles.length > maxLength) {
        //     this._alert('一次最多上传' + maxLength + '张图片')
        //     return
        // }

        // ------------------------------ 自定义上传 ------------------------------
        if (customUploadVideo && typeof customUploadVideo === 'function') {
            customUploadVideo(resultFiles, this.insertLinkVideo.bind(this))

            // 阻止以下代码执行
            return
        }

        // 添加视频数据
        const formdata = new FormData()
        arrForEach(resultFiles, file => {
            const name = uploadFileName || file.name
            formdata.append(name, file)
        })

        // ------------------------------ 上传视频 ------------------------------
        if (uploadVideoServer && typeof uploadVideoServer === 'string') {
            // 添加参数
            const uploadVideoServerArr = uploadVideoServer.split('#')
            uploadVideoServer = uploadVideoServerArr[0]
            const uploadVideoServerHash = uploadVideoServerArr[1] || ''
            objForEach(uploadImgParams, (key, val) => {
                // 因使用者反应，自定义参数不能默认 encode ，由 v3.1.1 版本开始注释掉
                // val = encodeURIComponent(val)

                // 第一，将参数拼接到 url 中
                if (uploadImgParamsWithUrl) {
                    if (uploadVideoServer.indexOf('?') > 0) {
                        uploadVideoServer += '&'
                    } else {
                        uploadVideoServer += '?'
                    }
                    uploadVideoServer = uploadVideoServer + key + '=' + val
                }

                // 第二，将参数添加到 formdata 中
                formdata.append(key, val)
            })
            if (uploadVideoServerHash) {
                uploadVideoServer += '#' + uploadVideoServerHash
            }

            // 定义 xhr
            const xhr = new XMLHttpRequest()
            xhr.open('POST', uploadVideoServer)

            // 设置超时
            xhr.timeout = timeout
            xhr.ontimeout = () => {
                // hook - timeout
                if (hooks.timeout && typeof hooks.timeout === 'function') {
                    hooks.timeout(xhr, editor)
                }

                // this._alert('上传文件超时')
                alert('上传文件超时')
            }

            // 监控 progress
            if (xhr.upload) {
                xhr.upload.onprogress = e => {
                    let percent
                    // 进度条
                    const progressBar = new Progress(editor)
                    if (e.lengthComputable) {
                        percent = e.loaded / e.total
                        progressBar.show(percent)
                    }
                }
            }

            // 返回数据
            xhr.onreadystatechange = () => {
                let result
                if (xhr.readyState === 4) {
                    if (xhr.status < 200 || xhr.status >= 300) {
                        // hook - error
                        if (hooks.error && typeof hooks.error === 'function') {
                            hooks.error(xhr, editor)
                        }

                        // xhr 返回状态错误
                        // this._alert('上传发生错误', `上传发生错误，服务器返回状态是 ${xhr.status}`)
                        alert(`上传发生错误，服务器返回状态是 ${xhr.status}`)
                        return
                    }

                    result = xhr.responseText
                    console.log(result)
                    if (typeof result !== 'object') {
                        try {
                            result = JSON.parse(result)
                        } catch (ex) {
                            // hook - fail
                            if (hooks.fail && typeof hooks.fail === 'function') {
                                hooks.fail(xhr, editor, result)
                            }

                            // this._alert('上传视频失败', '上传视频返回结果错误，返回结果是: ' + result)
                            alert('上传返回结果错误，返回结果是: ' + result)
                            return
                        }
                    }
                    if (!result.success) {
                        // 数据错误
                        alert('上传返回结果错误，返回结果 error=' + result.message)
                    } else {
                        if (hooks.customInsert && typeof hooks.customInsert === 'function') {
                            // 使用者自定义插入方法
                            hooks.customInsert(this.insertLinkVideo.bind(this), result, editor, type)
                        } else {
                            // 将视频插入编辑器
                            const url = result.content.url || ''
                            this.insertLinkVideo(url, type)
                        }

                        // hook - success
                        if (hooks.success && typeof hooks.success === 'function') {
                            hooks.success(xhr, editor, result)
                        }
                    }
                }
            }

            // hook - before
            if (hooks.before && typeof hooks.before === 'function') {
                const beforeResult = hooks.before(xhr, editor, resultFiles)
                if (beforeResult && typeof beforeResult === 'object') {
                    if (beforeResult.prevent) {
                        // 如果返回的结果是 {prevent: true, msg: 'xxxx'} 则表示用户放弃上传
                        this._alert(beforeResult.msg)
                        return
                    }
                }
            }

            // 自定义 headers
            objForEach(uploadImgHeaders, (key, val) => {
                xhr.setRequestHeader(key, val)
            })

            // 跨域传 cookie
            xhr.withCredentials = withCredentials

            // 发送请求
            xhr.send(formdata)
        }
    }
}

export default UploadVideo
