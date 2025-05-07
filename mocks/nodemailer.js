const nodemailer = {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'mockMessageId' }),
    })),
  };
  
  export default nodemailer;
  