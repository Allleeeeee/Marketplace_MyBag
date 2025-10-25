import {$authHost} from "./index";

export const createType = async (type) => {
    const {data} = await $authHost.post('api/type', type)
    return data
}
