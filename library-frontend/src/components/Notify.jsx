const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null
  }

  return (
    <div
      className={
        errorMessage.includes('error') ? 'errorMessage' : 'successMessage'
      }
    >
      {errorMessage}
    </div>
  )
}

export default Notify
