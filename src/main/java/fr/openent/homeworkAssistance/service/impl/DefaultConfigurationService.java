package fr.openent.homeworkAssistance.service.impl;

import fr.openent.homeworkAssistance.service.ConfigurationService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import org.entcore.common.service.impl.MongoDbCrudService;

public class DefaultConfigurationService extends MongoDbCrudService implements ConfigurationService {

    public DefaultConfigurationService(String collection) {
        super(collection);
    }

    @Override
    public void get(Handler<Either<String, JsonObject>> handler) {
        mongo.findOne(collection, new JsonObject(), event -> {
            JsonObject result = new JsonObject();
            if(event.body().containsKey("result"))
                result = event.body().getJsonObject("result");
            if(result.containsKey("messages"))
                handler.handle(new Either.Right(result));
            else
            handler.handle(new Either.Left<>("No waiting orders"));
        });
    }

    @Override
    public void update(Handler<Either<String, JsonObject>> handler, JsonObject settings) {
        mongo.findOne(collection, new JsonObject(), result -> {
            mongo.save(collection, settings, event -> {
                if(event.body().getString("status").equals("ok"))
                    handler.handle(new Either.Right(settings));
                else
                    handler.handle(new Either.Left<>("duplicated"));
            });
        });
    }

}
