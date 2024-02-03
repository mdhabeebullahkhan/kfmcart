import { useContext, useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DataContext } from '../store/GlobalState'
import CartItem from '../components/CartItem'
import { getData, postData } from '../utils/fetchData'
import { isLoggedInPopup } from '../components/SignIn/SignInCardFunctionalComponent'
import Address from '../components/Cart/Address'
import { getAddressObj, validateAddress } from '../components/Cart/util'
import { isAdminRole, isLoading } from '../utils/util'
import { ERROR_403 } from '../utils/constants'
import { handleUIError } from '../middleware/error'

const Cart = () => {
  const { state, dispatch } = useContext(DataContext)
  const { cart, auth, address } = state
  const [total, setTotal] = useState(0)
  const [callback, setCallback] = useState(false)
  const router = useRouter()
  const isAdmin = auth && auth.user && isAdminRole(auth.user.role)


  // useEffect(() => {
  //   console.log('cart : ', cart);

  //   const getCart = async () => {
  //     if (cart) {
  //       const res = await postData('cart?type=GC', cart);
  //       if (res.code) return handleUIError(res.err, res.code, undefined, dispatch);
  //       else if (res.cart) {

  //       }
  //     }
  //   }

  //   getCart();
  // }, [])


  useEffect(() => {
    const getTotal = () => {
      const res = cart.reduce((prev, item) => {
        return prev + (item.totalPrice * item.quantity)
      }, 0)
      setTotal(Number(res).toFixed(2))
    }
    getTotal()
  }, [cart])

  useEffect(() => {
    if (cart && cart.length > 0) {
      let newArr = []
      const updateCart = async () => {
        for (const item of cart) {
          const res = await getData(`product/${item._id}?dp=1`);
          if (!res.err && res.product && res.product.inStock > 0) {
            newArr.push({ ...res.product, quantity: item.quantity > res.product.inStock ? res.product.inStock : item.quantity })
          }
        }
        dispatch({ type: 'ADD_CART', payload: newArr })
      }
      updateCart();
    }
  }, [callback])

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!isLoggedInPopup(auth, dispatch)) return;
    if (isAdmin) return dispatch({ type: 'NOTIFY', payload: { error: ERROR_403 } })
    var shippingAddress = address;
    if (shippingAddress && shippingAddress.new && shippingAddress.new === '-1') shippingAddress = getAddressObj(document.getElementById('addressForm'));
    const validateAddressMsg = validateAddress(shippingAddress);
    if (validateAddressMsg) return dispatch({ type: 'NOTIFY', payload: { error: validateAddressMsg } });

    let newCart = [];
    let nonAvailProducts = [];
    for (const item of cart) {
      const res = await getData(`product/${item._id}?count=true`)
      if (res.count && (res.count - item.quantity >= 0)) newCart.push(item);
      else nonAvailProducts.push(item.title);
    }

    if (newCart.length < cart.length) {
      setCallback(!callback)
      return dispatch({
        type: 'NOTIFY', payload: {
          error: `This Product(s) - [${nonAvailProducts.join(',')}] quantity is insufficient or out of stock.`
        }
      })
    }
    isLoading(true, dispatch);
    postData('order', { address: shippingAddress, cart, total }, auth.token)
      .then(res => {
        if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
        if (res.newOrder) {
          return router.push(`/order?id=${res.newOrder._id}`)
        }
      })
  }

  if (cart.length === 0) {
    return (
      <div className='text-alingn-center'>
        <div className="sorry_and_continue_msg">
          Sorry, your <i className="fas fa-shopping-cart position-relative" aria-hidden="true"></i>cart is empty. Please add an item to place an order : <a href='/' style={{ fontWeight: '800' }}>
            Continue Shopping <i className="fas fa-home" aria-hidden="true" ></i></a>.
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid row justify-content-md-between">
      <Head>
        <title>KFM Cart - Cart Page</title>
      </Head>
      <h5 className="text-uppercase mt-3" >My Cart</h5>
      <div className="col-md-6 text-secondary table-responsive my-3 colHeight">
        <table className="table my-3">
          <tbody>
            {
              cart && cart.map(item => (
                <CartItem key={item._id} item={item} dispatch={dispatch} cart={cart} isAdmin={isAdmin} />
              ))
            }
          </tbody>
        </table>
      </div>

      <div className="shipping-card col-md-4 my-3 mx-md-3 text-left text-secondary shadow-card">
        <h5>Select a Delivery Address</h5>
        <Address />
        <h5 style={{ color: 'black' }}>Total: <span>₹{total}</span></h5>

        <Link href={auth.user ? '#!' : '/signin'} className="btn btn-primary my-2 cartPayBtn" onClick={handlePayment}>Proceed To Pay
        </Link>
      </div>
    </div>
  )
}

export default Cart