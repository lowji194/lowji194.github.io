/**
 * es6 | babel
 */
class Get2FaOtp {
    /**
     * @param {string} email
     */
    static validEmail(email) {
        const re = /\S+@\S+\.\S+/
        return re.test(email)
    }

    /**
     * @param {string} secret
     */
    static getOtp(secret) {
        return window.otplib.authenticator.generate(secret)
    }

    /**
     * @param {string} textContent
     */
    static getSecrets(textContent) {
        const lines = textContent.split('\n')
        return lines.reduce(
            (secrets, line) => {
                const lineInfo = line.replace(/ /g, '').split('|')
                const title = lineInfo.find(Get2FaOtp.validEmail) || lineInfo[0]
                const secret = [lineInfo[2], lineInfo[0]].find(
                    item => {
                        try {
                            return item &&
                                   item.match(/^[0-9a-zA-Z]{1,}$/) &&
                                   window.otplib.authenticator.decode(item)
                        } catch (error) {
                            return false
                        }
                    }
                )

                if (secret) {
                    secrets.push({ title, secret })
                }

                return secrets
            }, []
        )
    }
}

$(document).ready(function () {
    /**
     * @typedef {{
     *   title: string
     *   secret: string
     *   otp: string
     *   timeout?: number
     * }} OtpInfo
     */

    /**
     * @param {boolean} show
     */
    const toggleTableList = (show) => {
        $('#toggle-2fa-list').toggle(show)
    }

    /**
     * @param {OtpInfo} content
     */
    const renderTableItem = (content) => {
        return `<div class="form-row key2fa">
                    <div class="form-group col-md-3">
                        <label>Mã Code</label>
                        <div class="input-group mb-3 btn-copy-otp">
                            <input class="form-control faotp" placeholder="Mã Code" readonly value="${content.otp}">
                            <div class="input-group-append">
                                <button class="btn btn-outline-secondary btn-success btn-tone btn-nw" type="button" data-otp="${content.otp}">
                                    <i class="anticon anticon-key"></i>
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="form-group col-md-2 text-center">
                        <label>Thời gian</label>
                        <div class="m-t-10 time2fa">
                            <i class="anticon anticon-clock-circle"></i>
                            ${content.timeout}
                        </div>
                    </div>
                    <div class="form-group col-md-7">
                        <label>Thông tin KEY</label>
                        <input type="text" class="form-control" readonly placeholder="Thông tin KEY...." value="${content.secret}">
                    </div>
                </div>`
    }

    /**
     * @param {string} content
     */
    const renderTableList = (content) => {
        $('#toggle-2fa-list').html(
            `<div class="d-flex justify-content-between align-items-center">
                <h5 class="m-b-20">Thông tin từ KEY 2FA</h5>
            </div>` + content
        )
    }

    const renderOtpCodes = () => {
        const items = []
        const textContent = $('#SECRET2FA').val()
        const secrets = Get2FaOtp.getSecrets(textContent)
        const exists = []
        const authOptions = otplib.authenticator.allOptions()
        const timeout = authOptions.step - new Date(authOptions.epoch).getSeconds() % authOptions.step
        for (const { title, secret } of secrets) {
            if (exists.includes(secret)) {
                continue
            }

            exists.push(secret)
            items.push(
                renderTableItem({
                    title,
                    secret,
                    timeout,
                    otp: Get2FaOtp.getOtp(secret)
                })
            )
        }

        renderTableList(items.join(''))
        toggleTableList(Boolean(items.length))

        const next = new Date()
        next.setSeconds(next.getSeconds() + 1)
        next.setMilliseconds(0)
        const nextTimer = time(next) - time()
        setTimeout(renderOtpCodes, nextTimer)
    }

    /**
     * tick
     */
    renderOtpCodes()

    // $('#SECRET2FA').on('input', function () {
    //     const textContent = $(this).val()
    //     const secrets = Get2FaOtp.getSecrets(textContent)
    //     for (const { title, secret } of secrets) {
    //         codes[secret] = {
    //             title,
    //             secret
    //         }
    //     }
    // })

    $('#toggle-2fa-list').on('click', '.btn-copy-otp', function () {
        const otp = $(this).find('button').attr('data-otp')
        copy(otp)
        toastr.success(`Đã sao chép: ${otp}`)
    })
})
