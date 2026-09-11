import axios from "axios";
import React, { useState } from "react";
import '../assets/style/ticket.css';

const Ticket = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ticket, setTicket] = useState("");
  const [status, setStatus] = useState("");

  // Thay thế bằng token bot của bạn và chat ID
  const TELEGRAM_BOT_TOKEN = "8157137572:AAGahMNa3729RVAsDVlW1J0njPF1rFyXRCE";
  const TELEGRAM_CHAT_ID = "2075745493";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = `Có đơn hỗ trợ mới:
      - Tên khách hàng: ${name}
      - Email: ${email}
      - Nội dung: ${ticket}`;

    try {
      // Gửi thông báo tới Telegram
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
        }
      );
      setStatus("Ticket đã được gửi thành công!");
    } catch (error) {
      setStatus("Lỗi khi gửi ticket!");
      console.error(error);
    }

    // Reset form sau khi gửi
    setName("");
    setEmail("");
    setTicket("");
  };

  return (
    <div className="ticket-form-container">
      <h2>Gửi Hỗ Trợ</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Ticket:</label>
          <textarea
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
            required
          />
        </div>
        <button type="submit" class="my-button-class">Gửi</button>
      </form>

      {status && (
        <p className={status.includes("thành công") ? "success" : "error"}>
          {status}
        </p>
      )}
    </div>
  );
};

export default Ticket;
