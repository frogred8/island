import * as restify from 'restify';
import * as _ from 'lodash';
import { logger } from '../utils/logger';
import translateSchemaType from './schema-types';
import { RpcRequest } from '../services/rpc-service';
import { LogicError, FatalError, ISLAND } from '../utils/error';

const inspector = require('schema-inspector');

export function sanitize(subschema, target) {
  if (!subschema) return target;
  translateSchemaType(subschema);
  const result = inspector.sanitize(subschema, target);
  logger.debug('sanitized: %o', result.data);
  return result.data;
}

export function validate(subschema, target): boolean {
  if (!subschema) return true;
  translateSchemaType(subschema);
  const result = inspector.validate(subschema, target);
  logger.notice(`Is result valid? ${result.valid} / ${result.format()}`);
  return result.valid;
}

export default function paramSchemaInspector(req: RpcRequest) {
  if (!req.options.schema) return;
  if (!req.options.schema.query) return;
  const schema = req.options.schema.query.validation;
  if (schema) {
    const valid = validate(schema, req.msg);
    if (!valid) throw new LogicError(ISLAND.LOGIC.L0002_WRONG_PARAMETER_SCHEMA, `Wrong parameter schema`);
  }
  logger.debug(`RPC schema verified, RPC: ${req.name}`);
}

