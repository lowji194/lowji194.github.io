const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const time = (date) => date && date instanceof Date
    ? date.getTime()
    : new Date().getTime()

const copy = (text) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
}
