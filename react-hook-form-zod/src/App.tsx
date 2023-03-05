import { z } from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'

const formSchema = z
  .object({
    username: z
      .string()
      .min(2, { message: 'Имя пользователя слишком короткое' })
      .max(20, 'Имя пользователя слишком длинное')
      .transform((v) => v.toLowerCase().replace(/\s+/g, '_')),
    age: z
      .number()
      // .optional()
      .refine((v) => v > 17 && v < 66, {
        message: 'Возраст за пределами допустимого диапазона',
      }),
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль слишком короткий'),
    confirmPassword: z.string().min(6, 'Повторите пароль'),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'Примите условия использования' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Введенные пароли не совпадают',
  })

type FormSchema = z.infer<typeof formSchema>

function App() {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<FormSchema>({ resolver: zodResolver(formSchema) })

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    console.log(data)
    reset()
  }

  useEffect(() => {
    setFocus('username')
  }, [])

  return (
    <section className='bg-gray-50'>
      <div className='flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0'>
        <div className='w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0'>
          <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
            <h1 className='title'>Создание аккаунта</h1>
            <form className='space-y-7' onSubmit={handleSubmit(onSubmit)}>
              <div className='mb-4'>
                <label htmlFor='username' className='label'>
                  Имя пользователя *
                </label>
                <input
                  {...register('username')}
                  type='text'
                  id='username'
                  className='input'
                  placeholder='Ваше имя'
                  aria-invalid={errors.username ? 'true' : 'false'}
                />
                {errors.username && (
                  <span role='alert' className='error'>
                    {errors.username?.message}
                  </span>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='age' className='label'>
                  Возраст
                </label>
                <input
                  {...register('age', {
                    setValueAs: (v) => Number(v),
                  })}
                  type='number'
                  id='age'
                  className='input'
                  placeholder='От 18 до 65 лет'
                  aria-invalid={errors.age ? 'true' : 'false'}
                />
                {errors.age && (
                  <span role='alert' className='error'>
                    {errors.age?.message}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor='email' className='label'>
                  Адрес электронной почты *
                </label>
                <input
                  {...register('email')}
                  type='email'
                  id='email'
                  className='input'
                  placeholder='name@mail.com'
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <span role='alert' className='error'>
                    {errors.email?.message}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor='password' className='label'>
                  Пароль *
                </label>
                <input
                  {...register('password')}
                  type='password'
                  id='password'
                  placeholder='Не менее 6 символов'
                  className='input'
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                {errors.password && (
                  <span role='alert' className='error'>
                    {errors.password?.message}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor='confirmPassword' className='label'>
                  Подтверждение пароля *
                </label>
                <input
                  {...register('confirmPassword')}
                  type='password'
                  id='confirmPassword'
                  placeholder='Не менее 6 символов'
                  className='input'
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                {errors.confirmPassword && (
                  <span role='alert' className='error'>
                    {errors.confirmPassword?.message}
                  </span>
                )}
              </div>
              <div className='flex items-center relative'>
                <input
                  {...register('terms')}
                  id='terms'
                  aria-describedby='terms'
                  type='checkbox'
                  className='w-4 h-4 border border-gray-300 bg-gray-50 accent-primary-500 focus:outline-2 focus:outline-primary-500 outline-none'
                  aria-invalid={errors.terms ? 'true' : 'false'}
                />
                <label
                  htmlFor='terms'
                  className='font-light text-gray-500 text-sm ml-3 cursor-pointer select-none'
                >
                  Я принимаю{' '}
                  <a
                    className='font-medium text-primary-500 hover:text-primary-700 focus:text-primary-700 transition-colors outline-none'
                    href='#'
                  >
                    Условия использования
                  </a>
                </label>
                {errors.terms && (
                  <span className='error top-5'>{errors.terms?.message}</span>
                )}
              </div>
              <div className='flex gap-5 justify-center pt-2'>
                <button
                  type='submit'
                  className='btn btn-primary'
                  disabled={!isDirty || isSubmitting}
                >
                  Создать аккаунт
                </button>
                <button
                  type='button'
                  className='btn btn-error'
                  disabled={!isDirty || isSubmitting}
                  onClick={() => reset()}
                >
                  Очистить поля
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default App
