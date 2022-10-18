function Validator(formSelector) {
    var _this = this
    var formElement = document.querySelector(formSelector)
    var formRules = {}
    /*Quy ước tạo rules:
    -Nếu có lỗi thì return message lỗi 
    -Nếu không có lỗi thì return undefined
    */
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    function handleValidate(event) {
        let inputElement = event.target
        let parentElement = getParent(inputElement, '.form-group')
        let errorElement = parentElement.querySelector('.form-message')
        let errorMessage
        for(var rule of formRules[event.target.name]) {
            if(rule(event.target.value)) {
                errorMessage = rule(event.target.value)
                break
            }
        } 
        if(errorMessage) {
            parentElement.classList.add('invalid')
            errorElement.innerText = errorMessage
        } else {
            parentElement.classList.remove('invalid')
            errorElement.innerText = ""
        }
        return Boolean(errorMessage)
    }

    var validatorRules = {
        required(value) {
            return value ? undefined : 'Vui long nhap truong nay'
        },
        email(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Email ban nhap khong hop le'
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui long nhap toi thieu ${min} ki tu`
            }
        },
    } 
    
    if(formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')
        for(var input of inputs) {
            input.getAttribute('rules').replace(/\s/gi, '').split('|').forEach(inputRule => {
                var isRuleArray = inputRule
                if(inputRule.includes(':')) {
                    inputRule = inputRule.split(':')
                    isRuleArray =  inputRule[0] 
                    validatorRules[isRuleArray] = validatorRules[isRuleArray](inputRule[1])
                }
                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(validatorRules[isRuleArray])
                } else {
                    formRules[input.name] = [validatorRules[isRuleArray]]
                }
            })
            input.onblur = handleValidate;
            input.oninput = handleValidate;
        } 
        formElement.onsubmit = function(event) {
            event.preventDefault()
            let isValid = true
            for(var input of inputs) { 
                if(handleValidate({
                    target: input
                })) {
                    isValid = false
                }
            }
            if(isValid) {
                if(typeof _this.onsubmit  === 'function') {
                    var enableInput = document.querySelectorAll('[name]:not(meta)')
                    let dataUser =Array.from(enableInput).reduce((values, input) => {
                        values[input.name] = input.value
                        return values
                    }, {})
                    _this.onsubmit(dataUser)
                } else {
                    formElement.submit()
                }
            }
        }
    }
}