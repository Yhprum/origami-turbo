export default function contactUsTemplate(from: string, message: string) {
  return (
    <div>
      <div>
        <h1>Message from {from}</h1>
      </div>
      <hr />
      <div>
        <p>{message}</p>
      </div>
    </div>
  );
}
