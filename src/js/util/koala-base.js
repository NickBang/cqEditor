// 视频音频相关的mouseover事件
export function overIndex(_this) {
    // console.log(_this)
    let c_btn = _this.getElementsByClassName('cq-close-icon')[0]
    // console.log(c_btn)
    c_btn.style.display = 'block'

}

export function outIndex (_this) {
    let c_btn = _this.getElementsByClassName('cq-close-icon')[0]
    c_btn.style.display = 'none'
}
export function closeVideo (_this) {
    // 获取点击的对应视频
    let v = _this.parentElement.parentElement
    console.log(v);
    // 删除video标签并生成新的p
    let p = document.createElement('p')
    let br = document.createElement('br')
    let parent = v.parentElement
    let removed = parent.removeChild(v)
    parent.appendChild(p)
    p.appendChild(br)
}

// 删除卡片的事件
export function closeCard (_this) {
    // 获取点击的对应卡片
    let v = _this.parentElement
    console.log(v);
    // 删除标签并生成新的p
    let p = document.createElement('p')
    let br = document.createElement('br')
    let parent = v.parentElement
    let removed = parent.removeChild(v)
    // parent.appendChild(p)
    // p.appendChild(br)
}
