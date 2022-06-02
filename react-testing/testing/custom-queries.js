import { queryHelpers, buildQueries } from '@testing-library/react'

const queryAllByDataCy = (...args) =>
  queryHelpers.queryAllByAttribute('data-cy', ...args)

const getMultipleError = (c, dataCyValue) =>
  `Обнаружено несколько элементов с атрибутом data-cy: ${dataCyValue}`

const getMissingError = (c, dataCyValue) =>
  `Не обнаружен элемент с атрибутом data-cy: ${dataCyValue}`

const [
  queryByDataCy,
  getAllByDataCy,
  getByDataCy,
  findAllByDataCy,
  findByDataCy
] = buildQueries(queryAllByDataCy, getMultipleError, getMissingError)

export {
  queryByDataCy,
  queryAllByDataCy,
  getByDataCy,
  getAllByDataCy,
  findByDataCy,
  findAllByDataCy
}
