import axios from "../api/axios";

const getToken = () => {
    return localStorage.getItem("token");
};

export const getInvoices = async () => {

    const response = await axios.get(
        "/invoices",
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        });

    return response.data;
};

export const createInvoice = async (invoice) => {

    const response = await axios.post(
        "/invoices",
        invoice,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        });

    return response.data;
};

export const updateInvoice =
    async (id, invoice) => {

    const response = await axios.put(
        `/invoices/${id}`,
        invoice,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        });

    return response.data;
};

export const deleteInvoice =
    async (id) => {

    await axios.delete(
        `/invoices/${id}`,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        });
};

export const uploadInvoice =
    async (id, file) => {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    await axios.post(
        `/invoices/${id}/upload`,
        formData,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        });
};

export const verifyInvoice = async (id) => {
        const response = await axios.post(
            `/invoices/${id}/verify`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

        return response.data;
};