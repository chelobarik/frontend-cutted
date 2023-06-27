const API_URL = "http://localhost:8080/api",
    API_DELAY = 100;


export type APIResult = {
    error: string;
}

export type APIRequest<T> = APIResult & {
    data: T;
}

type Errored<T> = T & {
    httpStatus: 200 | 400 | 500;
}

// стандартный ответ API для метода DELETE
export interface IAPIResult {
    count: number | null; // число обработанных строк
    error: string; // ошибка если была
}



interface IApiCall {
    url: string;
    data?: string | object;
    method?: string;
    options?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const defaultErrorMessage = {
    200: '"OK"',
    201: '"Создано". Запрос успешно выполнен и в результате был создан ресурс.',
    400: '"Плохой запрос". Сервер не понимает запрос из-за неверного синтаксиса.',
    401: '"Неавторизовано". Для выполнения данной операции нужна аутентификация.',
    403: '"Запрещено". У клиента нет прав доступа к содержимому.',
    404: '"Не найден". Сервер не может найти запрашиваемый ресурс.',
    500: '"Внутренняя ошибка сервера". Сервер столкнулся с ситуацией, которую он не знает как обработать.',
    1000: 'Ошибка подключения к серверу. Сервер не отвечает на запросы.',
    1001: 'Ошибка сервера. Сервер не вернул идентификатор ID нового созданного ресурса в заголовке.'
}

class Api {
    token: string | null;
    baseURL: string;
    debugDelay?: boolean;
    status: number; // http status

    constructor(url: string) {
        this.baseURL = url
        this.token = localStorage.getItem('user-token')
        this.status = 200
    }

    statusText(customMessages?: { [k: number]: string }): string {
        const c = this.status,
            m = defaultErrorMessage;

        return (customMessages && customMessages[c]) ? customMessages[c] : (m[c] ? c + ': ' + m[c] : 'Неизвестная ошибка: ' + c)
    }

    // { url: "auth", data: user, method: "POST" }
    async dialOld<T>(param: IApiCall): Promise<T> {
        const opt = {
            ...param.options,
            headers: {
                'Content-Type': 'application/json',
            }
        }
        if (this.token) {
            opt.headers['Authorization'] = `Bearer ${this.token}`
        }
        if (param.method) {
            opt['method'] = param.method
        }
        if (param.data) {
            opt['body'] = JSON.stringify(param.data)
        }

        const response = await fetch(this.baseURL + param.url, opt)

        if (!response.ok) {
            throw new Error(response.statusText)
        }

        return await response.json()
    }

    async get<T>(param: IApiCall): Promise<T> {
        return this.dial({ ...param, method: 'GET' }) as Promise<T>
    }

    async post<T>(param: IApiCall): Promise<T> {
        return this.dial({ ...param, method: 'POST' }) as Promise<T>
    }

    async put<T>(param: IApiCall): Promise<void> {
        return this.dial({ ...param, method: 'PUT' }) as Promise<void>
    }

    async delete(param: IApiCall): Promise<void> {
        return this.dial({ ...param, method: 'DELETE' }) as Promise<void>
    }

    async patch<T>(param: IApiCall): Promise<void> {
        return this.dial({ ...param, method: 'PATCH' }) as Promise<void>
    }

    async dial<T>(param: IApiCall): Promise<T | number | void> {

        if (this.debugDelay) {
            console.log('пауза:', API_DELAY / 1000 + ' с.');
            return new Promise<T | number | void>((resolve) => {
                setTimeout(() => {
                    resolve(this.dial3(param))
                }, API_DELAY)
            })
        }

        return this.dial3(param)

    }

    async dial3<T>(param: IApiCall): Promise<T | number | void> {
        const opt = {
            ...param.options,
            headers: {
                'Content-Type': 'application/json',
            }
        }
        if (this.token) {
            opt.headers['Authorization'] = `Bearer ${this.token}`
        }
        if (param.method) {
            opt['method'] = param.method
        }
        if (param.data) {
            opt['body'] = JSON.stringify(param.data)
        }

        this.status = 200

        try {
            const response = await fetch(this.baseURL + param.url, opt)
            if (!response.ok) {
                this.status = response.status
                throw new Error('' + response.status)
            }

            // проверим на добавление нового элемента методом POST
            const isCreate = param.method == 'POST' && response.status == 201
            const isDelete = param.method == 'DELETE' && response.status == 200
            const isPatch = param.method == 'PATCH' && response.status == 200
            const isPut = param.method == 'PUT' && (response.status == 200 || response.status == 201)

            if (isDelete || isPatch || isPut) {
                return
            }

            if (isCreate) {
                // создан новый элемент, вернем его id
                const loc = response.headers.get("Location")

                if (!loc) new Error('1001')
                const id = loc ? +loc.split('/').slice(-1) : null

                if (!id) {
                    new Error('1001')
                    return -1
                } else {
                    return id
                }
            } else return await response.json()
        } catch (err: unknown) {
            if (this.status == 200 || this.status == 201) {
                const message = (err as Error)?.message ?? "Unknown error",
                    c = +message;
                if (c >= 200 && c <= 526) this.status = c
                else {
                    if (message == "Failed to fetch") {
                        this.status = 1000
                    }
                }
                throw new Error(message)
            } else {
                throw new Error('' + this.status)
            }
        }

    }
}

export default new Api(API_URL)
