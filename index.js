var $ = require('jquery');

exports.activateAutoSave =
    function () {
        var resetTimer = (function () {
            var timeout;
            return function (fn) {
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(fn, 700);
            };
        })();

        var saving = false;
        function autoSave(e) {
            //make sure only 1 save request is busy at a time
            if (saving) return null;
            var inputElement = $(this);
            return resetTimer(function () {
                saving = true;
                //get currently focused element
                var currentlyFocusedElement = document.activeElement;
                //get closest form to submit
                var form = inputElement.closest("form");

                //get url en serialize data
                var url = form.attr("action");
                var data = new FormData(form[0]);

                //disable all elements except the currently focused element
                form.find(":input").attr("disabled", "disabled");
                $(currentlyFocusedElement).removeAttr("disabled");

                //send the post request
                $.ajax({
                    method: 'POST',
                    url: url,
                    data: data,
                    contentType: false,
                    processData: false
                }).then(function (response) {
                    //for now we only support 1 autosave per page
                    var newForm = $(response).find("form[data-auto-save]");
                    var jFocusedElement = $(currentlyFocusedElement);
                    //check if the currently focused element is a text type, so we know to restore focus after the hot swap
                    var isInputText = !jFocusedElement.is('input[type="text"].select2-focusser') &&
                        jFocusedElement.is('input[type="text"]') ||
                        jFocusedElement.is("textarea");

                    var selectionStart;
                    var selectionEnd;
                    if (isInputText) {
                        selectionStart = currentlyFocusedElement.selectionStart;
                        selectionEnd = currentlyFocusedElement.selectionEnd;
                    }
                    //check if currently focused element is a date picker, so we can close the datepicker to restore focus after the hot swap
                    try {
                        var isDatepicker = jFocusedElement.is('input[type="text"].datepicker');
                        if (isDatepicker) {
                            jFocusedElement.datepicker('hide');
                        }

                    } catch (ex) {

                    }

                    //replace form with the form from the server
                    form.replaceWith(newForm);
                    //try to restore focus
                    setTimeout(function () { //place this shizzle on the eventloop (in order to render the element first, yep ... that's javascript!)
                        try {
                            if (isInputText) {
                                console.debug("try to restore focus");
                                var newFocus = $(document.getElementById(currentlyFocusedElement.id));
                                if (newFocus) {
                                    newFocus.val(currentlyFocusedElement.value);
                                    console.debug("focussing on ", newFocus);
                                    newFocus.focus();
                                    newFocus[0].setSelectionRange(selectionStart, selectionEnd);
                                }
                            };
                        } catch (exc) {
                            console.error("element",
                                currentlyFocusedElement.id,
                                newForm.find("#" + currentlyFocusedElement.id));
                            console.error(exc);
                        } finally {
                            // rerun setup javascripts
                            window.setupScriptsAfterPartialView();
                            bindEvents();
                            submitButton.prop("disabled", false);
                            //enable saving again
                            saving = false;
                        }
                    }, 0);
                });
            });
        }

        function bindEvents() {
            var form = $("form[data-auto-save]");
            form.find('[data-auto-save-trigger="text"]').on("keyup",
                function (e) {
                    var excludedKeys = [
                        "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter", "Escape", "Shift", "Super", "OS", "Control",
                        "Tab", "End", "Home"
                    ];
                    if (excludedKeys.indexOf(e.key) !== -1) {
                        return false;
                    }
                    return autoSave.call(this, arguments);
                });
            form.find('[data-auto-save-trigger="checkbox"]').on("change", autoSave);
            form.find('[data-auto-save-trigger="button"]').click(autoSave);
            form.find('[data-auto-save-trigger="datepicker"]').on("changeDate", autoSave);
            form.find('[data-auto-save-trigger="lookup"]').on("change", autoSave);
        }

        bindEvents();

    };