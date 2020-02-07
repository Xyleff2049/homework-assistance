package fr.openent.homeworkAssistance.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;

public interface CallbackService {

    /**
     * send data to Kiamo
     */
    public void send(JsonObject form, Handler<Either<String, JsonObject>> handler);

}
