package fr.openent.homeworkAssistance.controller;

import fr.openent.homeworkAssistance.HomeworkAssistance;
import fr.wseduc.rs.Get;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.vertx.java.core.http.RouteMatcher;
import java.util.Map;

public class HomeworkAssistanceController extends ControllerHelper {
    private EventStore eventStore;
    private enum HomeworkAssistanceEvent { ACCESS }


    public HomeworkAssistanceController() {
        super();
    }

    @Override
    public void init(Vertx vertx, JsonObject config, RouteMatcher rm, Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
        super.init(vertx, config, rm, securedActions);
        eventStore = EventStoreFactory.getFactory().getEventStore(HomeworkAssistance.class.getSimpleName());
    }

    @Get("")
    @SecuredAction("view")
    public void view (HttpServerRequest request) {
        renderView(request, new JsonObject());
        eventStore.createAndStoreEvent(HomeworkAssistanceEvent.ACCESS.name(), request);
    }
}
