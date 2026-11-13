import axios from "../api/axios";

const getToken = () => {

    return localStorage.getItem("token");
};

export const getCompanies = async () => {

    const response =
        await axios.get(
            "/companies",
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            });

    return response.data;
};

export const getCompanyOptions = async () => {
    const response = await axios.get("/companies/options", {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    return response.data;
};

export const createCompany =
    async (company) => {

    const response =
        await axios.post(
            "/companies",
            company,
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            });

    return response.data;
};

export const updateCompany =
    async (id, company) => {

    const response =
        await axios.put(
            `/companies/${id}`,
            company,
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            });

    return response.data;
};

export const deleteCompany =
    async (id) => {

    await axios.delete(
        `/companies/${id}`,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        });
};