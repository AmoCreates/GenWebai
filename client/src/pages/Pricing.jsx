import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowLeft, Check, Coins } from "lucide-react";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios.js";
import { setUserData } from "../redux/userSlice.js";

const Pricing = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      key: "trial",
      name: "Trial",
      price: 20,
      credits: 100,
      description: "Perfect to explore GenWeb.ai",
      features: [
        "Ai website generation",
        "Responsive HTML output",
        "Basic animations",
      ],
      popular: false,
      button: "Get Started",
    },

    {
      key: "pro",
      name: "Pro",
      price: 499,
      credits: 700,
      description: "For serious creators & freelancers",
      features: [
        "Everything in Free",
        "Faster generation",
        "Edit & regenerate",
      ],
      popular: true,
      button: "Upgrade to Pro",
    },

    {
      key: "enterprise",
      name: "Enterprise",
      price: 1499,
      credits: 2500,
      description: "For teams & power users",
      features: [
        "Unlimited iterations",
        "Highest priority",
        "Team collaboration",
        "Dedicated support",
      ],
      popular: false,
      button: "Contact Sales",
    },
  ];

  useGSAP(() => {
    gsap.from("header", {
      y: 24,
      opacity: 0,
      duration: 1,
    });
  });

  const container = useRef();
  useGSAP(
    () => {
      gsap.from(".plan", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        clearProps: "all",
      });
    },
    { scope: container },
  );

  const handleBilling = async (planKey) => {
    const selectedPlan = plans.find((p) => p.key === planKey);
    if (!selectedPlan) return;

    if (!userData?._id) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    setLoading(planKey);

    try {
      const { data } = await API.post(
        "/api/payment/create-order",
        {
          amount: selectedPlan.price,
          planType: planKey,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token || userData.accessToken}`, // Try both
          },
          withCredentials: true,
        },
      );

      if (!data.success || !data.order) {
        alert("Failed to create payment order - " + (data.message || ""));
        return;
      }

      // If we reach here → Razorpay should open
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "GenWeb.ai",
        description: `${selectedPlan.name} Plan - ₹${selectedPlan.price}`,
        order_id: data.order.id,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        prefill: {
          name: userData.name || "anonymous",
          email: userData.email || "anonymous@anonymous.anonymous",
          contact: "9999999999",
        },
        theme: { color: "#4F46E5" },

        handler: async function (response) {
          try {
            const verifyRes = await API.post(
              "/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${userData.token || userData.accessToken}`,
                },
                withCredentials: true,
              },
            );

            if (verifyRes.data.success) {
              alert(
                `🎉 Payment Successful!\n${verifyRes.data.creditsAdded} credits added to your account.\nTotal Credits: ${verifyRes.data.totalCredits}`,
              );
              dispatch(
                setUserData({
                  ...userData,
                  credits: verifyRes.data.totalCredits,
                }),
              );
              navigate("/");
            } else {
              alert("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            alert(
              "Payment completed but credits update failed. Please contact support.",
            );
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error Response:", error.response?.data);
      alert(error.response?.data?.message || "Failed to create payment order");
    } finally {
      setLoading(null);
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white px-6 pt-16 pb-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <Link
        to="/"
        className="relative z-10 mb-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft /> Back
      </Link>

      <header className="relative z-10 mx-auto max-w-4xl mx-auto text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-zinc-400 text-lg">
          Buy credits once. Build anytime.
        </p>
      </header>

      <div
        ref={container}
        className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {plans.map((plan, key) => {
          return (
            <div
              key={key}
              className={`plan relative rounded-3xl p-8 border backdrop-blur-xl hover:-translate-y-2.5 hover:scale-105
            ${
              plan.popular
                ? "border-indigo-500 bg-linear-to-b rom-indigo-500/20 to-transparent shadow-2xl shadow-indigo-500/30"
                : "border-white/10 bg-white/5 hover:border-indigo-400 hover:bg-white/10"
            }`}
            >
              {plan.popular && (
                <span className="absolute top-5 right-5 py-1 px-3 text-xs rounded-full bg-indigo-500">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-zinc-400 text-sm mb-6">{plan.description}</p>

              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="text-sm text-zinc-400 mb-1">/one-time</span>
              </div>

              <div className="flex items-end gap-1 mb-8">
                <Coins className="text-yellow-400" />
                <span className="font-semibold">{plan.credits} Credits</span>
              </div>

              <ul className="space-y-3 mb-10">
                {plan.features.map((feature, key) => {
                  return (
                    <li
                      key={key}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <Check className="text-green-400" />
                      {feature}
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={() => handleBilling(plan.key)}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading === plan.key ? "Processing..." : plan.button}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
