import axios from "../api/axios";


const getToken = () => {
    return localStorage.getItem("token");
};

export const getPayments =
    async () => {

    const response =
        await axios.get(
            "/payments",
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            });

    return response.data;
};

export const getPaymentCollections = async () => {
    const response = await axios.get("/payments/collections", {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    return response.data;
};

export const sweepOverduePayments = async () => {
    const response = await axios.post(
        "/payments/sweep-overdue",
        {},
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );

    return response.data;
};

export const createPayment =
    async (payment) => {

    const response =
        await axios.post(
            "/payments",
            payment,
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            });

    return response.data;
};

export const updatePayment =
    async (id, payment) => {

    const response =
        await axios.put(
            `/payments/${id}`,
            payment,
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            });

    return response.data;
};

export const deletePayment =
    async (id) => {

    await axios.delete(
        `/payments/${id}`,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        });
};

export const uploadReceipt =
    async (id, file) => {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    await axios.post(
        `/payments/${id}/receipt`,
        formData,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        });
};
