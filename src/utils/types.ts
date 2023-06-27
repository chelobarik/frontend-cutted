export type VForm = Vue & {
    /**
     * Производит валидацию формы и вызывает колбэк с результатом "valid"
     *
     * @param {(valid: boolean) => void} callback
     */
    validate(callback: (valid: boolean) => void): void;


    /**
     * Очищает все поля ввода у формы
     */
    resetFields(): void;
}



// iview-ui Modal 

export type VModal = Vue & {

    /**
     * Вызывает нажатие на кнопку "Ok"
     */
    ok(): void;

    /**
     * Показывает индикатор загрузки на кнопке "Ok"
     *
     * @type {boolean}
     */
    buttonLoading: boolean;

};

/**
 *  Используется в событии change InlineEditor.vue
 */
export type ChangeEvent = Event & { data: string };
