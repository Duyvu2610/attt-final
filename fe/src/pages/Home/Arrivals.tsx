import { Link } from 'react-router-dom';
import Products from '../../components/Products';
import Title from '../../components/Title';
import { Product } from '../../types/types';
import config from '../../config';
import { callApi } from '../../api/axios';
import { getNewProduct } from '../../api/homeApi';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notification } from 'antd';

const Arrivals: React.FC = () => {
    const [data, setData] = useState<Product[]>([]);
    const {t} = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            const result: Product[] = await callApi(() => getNewProduct().catch((err) => notification.error({message: err, duration: 1.5})));
            setData(result);
        };

        fetchData();
    }, []);

    return (
        <div className="wrapper">
            <div className="py-[64px]">
                <Title className="text-center text-[32px] lg:text-[40px] mb-[64px] uppercase">{t("title.new-product")}</Title>
                <Products data={data} />
                <div className="text-center mt-[36px] pb-[64px] border-b">
                    <Link to = {config.routes.product} className="px-[54px] py-4 border rounded-[62px] w-full lg:w-auto  transition-all duration-300 hover:border-blue-400 ">
                        {t("button.read-more")}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Arrivals;