import axios from "../api/axios";

const getToken = () => {
    return localStorage.getItem("token");
};

export const getDeals = async () => {

    const response = await axios.get(
        "/factoring-deals",
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

    return response.data;
};

export const createDeal = async (deal) => {

    const response = await axios.post(
        "/factoring-deals",
        deal,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

    return response.data;
};

export const updateDeal =
    async (id, deal) => {

    const response =
        await axios.put(
            `/factoring-deals/${id}`,
            deal,
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            });

    return response.data;
};

export const deleteDeal = async (id) => {

    const response = await axios.delete(
        `/factoring-deals/${id}`,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

    return response.data;
};