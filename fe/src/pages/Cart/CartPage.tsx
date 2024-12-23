import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import { callApi, getCartByUser, payCart } from "../../api/axios";
import { Emitter as emitter } from "../../eventEmitter/EventEmitter";
import { RootState } from "../../redux/store";
import { CardInfo, GetCartReponseDto, Order, OrderRequest } from "../../types/types";
import { addListCartPay } from "../../redux/appSlice";

import CartDetail from "./CartDetail";
import Button from "../../components/Button";

import routes from "../../config/routes";

import { useTranslation } from "react-i18next";
function CartPage() {
  const [products, setProducts] = useState<GetCartReponseDto[]>([]);
  const [totalCard, setTotalCard] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isRerender, setIsRerender] = useState<boolean>(false);
  const [listCartPay, setListCartPay] = useState<CardInfo[]>([]);

  const user = useSelector((state: RootState) =>  state.auth.currentUser)

  const navigate = useNavigate();

  const dispatch = useDispatch()
    const {t} = useTranslation();

  useEffect(() => {
    const fecth = async () => {
      user ? setProducts(await callApi(() => getCartByUser(Number(user.id)))) : setProducts([]);
    }
    fecth();
    window.scrollTo(0, 0);
  }, [isRerender]);

  useEffect(() => {
    const handleChecked = (element: CardInfo) => {
      setTotalCard((prevQuantity) => prevQuantity + element.quantity);
      setTotalPrice((prevPrice) => prevPrice + element.price);
      setListCartPay((prev) => {
        const index = prev.findIndex((item) => item.id === element.id);
        if (index === -1) {
          // Nếu element không tồn tại trong listCartPay, thêm mới
          return [...prev, element];
        } else {
          // Nếu element đã tồn tại, cập nhật quantity
          return prev.map((item, idx) =>
            idx === index ? { ...item, quantity: item.quantity + element.quantity } : item
          );
        }
      });
    };

    const handleUnchecked = (element: CardInfo) => {
      setTotalCard((prevQuantity) => prevQuantity - element.quantity);
      setTotalPrice((prevPrice) => prevPrice - element.price);
      setListCartPay((prev) => prev.filter((item) => item.id !== element.id));
      setIsChecked(false);
    };

    const handleDeletedCard = () => {
      setIsRerender(prev => !prev);
    }

    emitter.on("elementChecked", handleChecked);
    emitter.on("elementUnchecked", handleUnchecked);
    emitter.on("deletedCard", handleDeletedCard);

    return () => {
      emitter.off("elementChecked", handleChecked);
      emitter.off("elementUnchecked", handleUnchecked);
      emitter.off("deletedCard", handleDeletedCard);
    };
  }, [products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isCheckedNew = e.target.checked;
    setIsChecked(isCheckedNew);
    emitter.emit("checkAll", isCheckedNew);
  };

  const handleBuyProduct = async () => {
    if (products.length === 0) return;
    if (listCartPay.length === 0) {
      toast.error("Vui lòng chọn sản phẩm để mua");
      return;
    }
    const fecth = async () => {
      if (!user) {
        toast.error("User not found");
        return;
      }
      try {
        const orderRequest = {
          userId: Number(user.id),
          orderDetails: listCartPay.map((item) => {
            return {
              productId: item.productId,
              amount: item.quantity,
            };
          }),
        } as OrderRequest;
        await callApi(() => payCart(orderRequest));
        setIsRerender(prev => !prev);
        setTotalCard(0);
        setTotalPrice(0);
        setIsChecked(false);
        dispatch(addListCartPay(listCartPay))
        navigate(routes.thank);
        emitter.emit("updateCartNumber");
      } catch (error) {
        toast.error("Số lượng mua vượt quá số lượng trong kho");
      }
    }
    fecth();
  }

  return (
    <div className="pb-[160px] bg-[#f5f5f5]">
      <div className="wrapper px-5 ">
        <div className="flex justify-between items-center px-8 py-4 mb-4 bg-white">
          <div className="flex-1">
            <input
              type="checkbox"
              id="checkAll"
              className="mr-4"
              onChange={handleChange}
              checked={isChecked}
            />
            <label htmlFor="checkAll" className="cursor-pointer select-none">{t("text.chooseAll")}</label>
          </div>
          <div className="flex flex-1 justify-between text-[#888888]">
            <div className="flex-1 text-center">{t("text.unitPrice")}</div>
            <div className="flex-1 text-center">{t("text.quantity")}</div>
            <div className="flex-1 text-center">{t("text.price")}</div>
            <div className="flex-1 text-end">{t("text.operation")}</div>
          </div>
        </div>
        <div className="flex flex-col gap-1 mb-4">
          {
            products.map((product, index) => {
              return <CartDetail getCardReponseDto={product} key={index} />;
            })
          }
        </div>
        <div className="flex justify-between items-center px-8 py-4 mb-4 bg-white">
          <div className="flex-1">
          </div>
          <div className="flex flex-1 justify-between text-[#888888] items-center">
            <div className="text-center">
            {t("text.totalPrice")} ({totalCard} {t("text.product")}):{" "}
              <span className="text-[#EE4D2D]">đ{totalPrice}</span>
            </div>
            <Button onClick={handleBuyProduct} className={`${products.length !== 0 ? "" : "select-none cursor-not-allowed"}`}>
            {t("button.buy")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
