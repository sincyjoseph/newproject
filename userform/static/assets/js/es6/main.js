// https://stackoverflow.com/a/41992719
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      if (typeof start !== 'number') {
        start = 0;
      }

      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }

  $(function () {
    "use strict";

    // STEP FORM
    const pStepForm = {
        noValidate: [],
        submitvariable:0,
        issuccessurl: false,
        init: function () {
            var me = this
            this.noValidate.push('middlename')

            $('select[name="country"]').change(function() {
                if ($(this).val() == 'india'){
                    var choices = [['kerala','Kerala'], ['karnataka','Karnataka'], ['tamilnadu','Tamilnadu']]
                    pStepForm.renderSelectBox('state',choices,'Select a state')
                }
                else if ($(this).val() == 'usa'){
                    var choices = [['alabama','Alabama'],['alaska','Alaska'], ['arizona','Arizona']]
                    pStepForm.renderSelectBox('state',choices,'Select a state')
                }
                else if ($(this).val() == 'uk'){
                    var choices = [['london','London'],['kent','Kent'], ['devon','Devon']]
                    pStepForm.renderSelectBox('state',choices,'Select a state')
                }
                else{
                    var choices = []
                    pStepForm.renderSelectBox('state', choices, 'Select a state')
                }
            })
        },

        renderSelectBox: function(nameOfSelect, choices, firstItem) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            choices = [['',firstItem],].concat(choices);
            choices.forEach(function(value,index,array){
                allOptions += `<option value="${value[0]}">${value[1]}<options>`;
            });
            $(`select[name=${nameOfSelect}]`).html(allOptions);
        },

        validate: function () {
            const all_input_elements = $('#userdetials').find('input')
            const all_select_elements = $('#userdetials').find('select')
            const error_elements = []
            for (let i = 0; i < all_input_elements.length; i++) {
                if ($(all_input_elements[i]).val() === "") {
                    const input_name = $(all_input_elements[i]).attr('name')
                    if (!this.noValidate.includes(input_name))
                        error_elements.push(all_input_elements[i])
                }
            }
            for (let i = 0; i < all_select_elements.length; i++) {
                if ($(all_select_elements[i]).val() === "") {
                    const input_name = $(all_select_elements[i]).attr('name')
                    if (!this.noValidate.includes(input_name))
                        error_elements.push(all_select_elements[i])
                }
            }
            if (error_elements.length > 0) {
                this.renderError(error_elements)
                return false
            }
            return true
        },

        renderError: function (elements) {
            let offsetTop = 1000000;
            elements.forEach(function (element) {
                if ($(element).offset().top < offsetTop)
                    offsetTop = $(element).offset().top
                $(element).addClass('error')
            })
            $(window).scrollTop(offsetTop - 140);
            this.removeError()
        },

        removeError: function () {
            const all_input_elements = $('#userdetials').find('input')
            const all_select_elements = $('#userdetials').find('select')
            for (let i = 0; i < all_input_elements.length; i++) {
                if ($(all_input_elements[i]).val() !== "") {
                    $(all_input_elements[i]).removeClass('error')
                }
            }
            for (let i = 0; i < all_select_elements.length; i++) {
                if ($(all_select_elements[i]).val() !== "") {
                    $(all_select_elements[i]).removeClass('error')
                }
            }
        },

        removeFromNoValidate: function(nameOfInput) {
            var index = this.noValidate.indexOf(nameOfInput);
            if(index > -1)
                this.noValidate.splice(index,1);
        },

        addSubmitButtonMessage: function (errorMessage) {
            $('#error-display-near-submit').removeClass('d-none');
            $('#error-display-near-submit').html(errorMessage);
        },

    }
    
    pStepForm.init()
    $('#userdetials').submit(function (e) {
        var validationFlag = pStepForm.validate();
        console.log(validationFlag)
        if (validationFlag) {
            // Valid let the form do it
            pStepForm.addSubmitButtonMessage('Your form is being submitted. Please wait.')
        } else {
            e.preventDefault();
        }  
    })
    
  })